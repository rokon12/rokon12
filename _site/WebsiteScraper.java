///usr/bin/env jbang "$0" "$@" ; exit $?
//DEPS org.jsoup:jsoup:1.15.4
//DEPS com.fasterxml.jackson.core:jackson-databind:2.14.2
//DEPS commons-io:commons-io:2.11.0
//DEPS com.vladsch.flexmark:flexmark-all:0.64.0

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.FileUtils;
import com.vladsch.flexmark.html2md.converter.FlexmarkHtmlConverter;

import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

public class WebsiteScraper {
    private static final String WEBSITE_URL = "https://bazlur.ca";
    private static final String OUTPUT_DIR = "_posts";
    private static final String IMAGES_DIR = "images";
    private static final String RECORD_FILE = "record.json";
    private static final String PROGRESS_FILE = "scraper_progress.json";
    private static final int MAX_ARTICLES = Integer.MAX_VALUE; // Limit for testing
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final FlexmarkHtmlConverter htmlToMarkdownConverter = FlexmarkHtmlConverter.builder().build();
    private static final int REQUEST_DELAY_MS = 1000; // Reduced delay for testing
    private static final int CONNECTION_TIMEOUT_MS = 120000; // 120 seconds
    private static final int IMAGE_RETRY_COUNT = 3;

    private static class Progress {
        @com.fasterxml.jackson.annotation.JsonTypeInfo(use = com.fasterxml.jackson.annotation.JsonTypeInfo.Id.CLASS)
        public Set<String> processedUrls = new HashSet<>();

        @com.fasterxml.jackson.annotation.JsonTypeInfo(use = com.fasterxml.jackson.annotation.JsonTypeInfo.Id.CLASS)
        public Queue<String> pagesToProcess = new LinkedList<>();

        @com.fasterxml.jackson.annotation.JsonTypeInfo(use = com.fasterxml.jackson.annotation.JsonTypeInfo.Id.CLASS)
        public Map<String, String> existingArticles = new HashMap<>();

        public int totalPages;
        public int currentPage;

        public void save() throws IOException {
            saveFileAtomically(PROGRESS_FILE, this);
            saveFileAtomically(RECORD_FILE, existingArticles);
        }

        private void saveFileAtomically(String targetPath, Object data) throws IOException {
            File tempFile = new File(targetPath + ".tmp");
            objectMapper.writeValue(tempFile, data);
            Files.move(tempFile.toPath(),
                      new File(targetPath).toPath(),
                      StandardCopyOption.ATOMIC_MOVE,
                      StandardCopyOption.REPLACE_EXISTING);
        }

        @SuppressWarnings("unchecked")
        public static Progress load() throws IOException {
            Progress progress = new Progress();

            File progressFile = new File(PROGRESS_FILE);
            if (progressFile.exists()) {
                progress = objectMapper.readValue(progressFile, Progress.class);

                if (progress.processedUrls == null) {
                    log("Progress file corrupted, starting fresh session");
                    progress = new Progress();
                } else if (progress.pagesToProcess.isEmpty() && !progress.processedUrls.isEmpty()) {
                    progress = recoverFromEmptyQueue(progress);
                } else {
                    log("Resuming from previous session with " + progress.pagesToProcess.size() + " pages remaining");
                }
            }

            loadExistingRecord(progress);
            initializeQueueIfEmpty(progress);
            ensureFrontPageInQueue(progress);

            return progress;
        }

        private static Progress recoverFromEmptyQueue(Progress progress) {
            String lastProcessedUrl = progress.processedUrls.stream()
                .filter(url -> url.contains("/page/"))
                .max(Comparator.comparingInt(WebsiteScraper::extractPageNumber))
                .orElse("");

            if (lastProcessedUrl.isEmpty()) {
                log("No page progress found, starting fresh session");
                return new Progress();
            }

            try {
                int lastPage = extractPageNumber(lastProcessedUrl);
                log("Resuming from page " + lastPage);

                progress.pagesToProcess.add(WEBSITE_URL + "/page/" + (lastPage + 1) + "/");
                progress.totalPages = lastPage + 1;
                progress.currentPage = lastPage;

                progress.processedUrls.removeIf(url -> {
                    try {
                        return extractPageNumber(url) > lastPage;
                    } catch (Exception e) {
                        return false;
                    }
                });
                return progress;
            } catch (Exception e) {
                log("Error parsing last page number, starting fresh session");
                return new Progress();
            }
        }

        @SuppressWarnings("unchecked")
        private static void loadExistingRecord(Progress progress) {
            File recordFile = new File(RECORD_FILE);
            if (recordFile.exists()) {
                try {
                    progress.existingArticles = objectMapper.readValue(recordFile, Map.class);
                    log("Loaded existing record with " + progress.existingArticles.size() + " articles");
                } catch (IOException e) {
                    log("Warning: Could not load record file: " + e.getMessage());
                    progress.existingArticles = new HashMap<>();
                }
            }
        }

        private static void initializeQueueIfEmpty(Progress progress) {
            if (progress.pagesToProcess.isEmpty()) {
                progress.pagesToProcess.add(WEBSITE_URL);
                progress.totalPages = 1;
                progress.currentPage = 0;
            }
        }

        private static void ensureFrontPageInQueue(Progress progress) {
            if (!progress.pagesToProcess.contains(WEBSITE_URL)) {
                LinkedList<String> q = new LinkedList<>(progress.pagesToProcess);
                q.addFirst(WEBSITE_URL);
                progress.pagesToProcess = q;
            }
        }
    }

    private static int extractPageNumber(String url) {
        try {
            return Integer.parseInt(url.replaceAll(".*/page/(\\d+)/.*", "$1"));
        } catch (Exception e) {
            return 0;
        }
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void log(String message) {
        System.out.println("[" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "] " + message);
    }

    public static void main(String... args) {
        try {
            log("Starting website content backup process");

            Files.createDirectories(Paths.get(OUTPUT_DIR));
            Files.createDirectories(Paths.get(IMAGES_DIR));
            log("Created output directory: " + OUTPUT_DIR);

            Progress progress = Progress.load();
            log("Loaded progress: " + progress.currentPage + " pages processed, " +
                progress.pagesToProcess.size() + " pages remaining");

            int newArticles = 0;
            int processedImages = 0;
            int processedArticles = 0;

            while (!progress.pagesToProcess.isEmpty()) {
                String currentUrl = progress.pagesToProcess.poll();
                if (progress.processedUrls.contains(currentUrl) && !currentUrl.equals(WEBSITE_URL)) {
                    continue;
                }

                progress.currentPage++;
                log(String.format("Processing page %d/%d: %s", progress.currentPage, progress.totalPages, currentUrl));
                sleep(REQUEST_DELAY_MS);

                Document doc;
                try {
                    doc = fetchDocument(currentUrl);
                } catch (IOException e) {
                    log("Warning: Failed to fetch page " + currentUrl + ": " + e.getMessage());
                    continue;
                }
                progress.processedUrls.add(currentUrl);

                if (progress.currentPage % 5 == 0) {
                    progress.save();
                    log("Progress saved");
                }

                enqueueNextPages(doc, progress);

                Elements articles = doc.select("article");
                log("Found " + articles.size() + " articles on " + currentUrl);

                for (Element article : articles) {
                    try {
                        Element titleElement = article.select("h1, h2").first();
                        Element linkElement = article.select("a").first();

                        if (titleElement == null || linkElement == null) {
                            log("Warning: Skipping article due to missing title or link");
                            continue;
                        }

                        String title = titleElement.text();
                        String url = linkElement.attr("abs:href");

                        if (progress.existingArticles.containsKey(url)) {
                            continue;
                        }

                        log("Processing new article: " + title);

                        sleep(REQUEST_DELAY_MS);
                        Document articleDoc = fetchDocument(url);

                        Element content = articleDoc.select("article").first();
                        if (content == null) {
                            log("Warning: Could not find article content for: " + title);
                            continue;
                        }

                        removeUnwantedElements(content);

                        processedImages += downloadArticleImages(articleDoc, content);

                        String publishDate = extractPublishDate(content, doc, url);
                        String fileDate = extractFileDate(publishDate);
                        if (!publishDate.contains("T")) {
                            publishDate = fileDate + "T00:00:00+00:00";
                        }

                        String featuredImage = extractFeaturedImage(content);
                        List<String> tags = extractTags(doc);

                        String markdown = htmlToMarkdownConverter.convert(content.html());
                        String fullContent = buildFrontMatter(title, url, publishDate, featuredImage, tags) + markdown;

                        String sanitizedTitle = title.replaceAll("[^a-zA-Z0-9\\s]", "").replaceAll("\\s+", "-").toLowerCase();
                        String fileName = fileDate + "-" + sanitizedTitle + ".md";
                        Files.write(Paths.get(OUTPUT_DIR, fileName), fullContent.getBytes(StandardCharsets.UTF_8));

                        progress.existingArticles.put(url, fileName);
                        newArticles++;
                        processedArticles++;

                        log("Successfully processed article: " + title);

                        if (processedArticles >= MAX_ARTICLES) {
                            log("Reached article limit of " + MAX_ARTICLES + ". Stopping.");
                            progress.save();
                            return;
                        }
                    } catch (Exception e) {
                        log("Error processing article: " + e.getMessage());
                    }
                }
            }

            progress.save();

            log("Backup completed successfully:");
            log("- Pages processed: " + progress.currentPage);
            log("- New articles processed: " + newArticles);
            log("- Images downloaded: " + processedImages);
            log("- Total articles in record: " + progress.existingArticles.size());

        } catch (Exception e) {
            log("Fatal error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static Document fetchDocument(String url) throws IOException {
        return Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(CONNECTION_TIMEOUT_MS)
                    .get();
    }

    private static void enqueueNextPages(Document doc, Progress progress) {
        Elements nextPageLinks = doc.select("a.next.page-numbers");
        for (Element nextLink : nextPageLinks) {
            String nextUrl = nextLink.attr("abs:href");
            if (!progress.processedUrls.contains(nextUrl)) {
                progress.pagesToProcess.add(nextUrl);
                progress.totalPages++;
                log(String.format("Found next page (%d total): %s", progress.totalPages, nextUrl));
            }
        }
    }

    private static void removeUnwantedElements(Element content) {
        content.select(".sharedaddy, .jp-relatedposts, .entry-meta, .entry-footer").remove();
        content.select("h3:contains(Discover more from A N M Bazlur Rahman)").remove();
        content.select("p:contains(Subscribe to get the latest posts sent to your email)").remove();
        content.select("p:contains(Type your email...)").remove();
        content.select("p:contains(Subscribe)").remove();
    }

    private static int downloadArticleImages(Document articleDoc, Element content) {
        Elements allImages = articleDoc.select("article img, .entry-content img, .post-content img, figure img");
        Set<String> downloadedImages = new HashSet<>();
        int count = 0;

        for (Element img : allImages) {
            try {
                String imgUrl = resolveImageUrl(img);
                if (imgUrl.isEmpty() || downloadedImages.contains(imgUrl) || imgUrl.startsWith("data:")) {
                    continue;
                }

                String imgName = sanitizeImageName(imgUrl);
                File imgFile = new File(IMAGES_DIR + "/" + imgName);

                if (imgFile.exists()) {
                    log("Image already exists, skipping: " + imgName);
                    updateImageReferences(img, content, imgUrl, imgName);
                    continue;
                }

                log("Downloading image: " + imgUrl + " -> " + imgName);
                sleep(REQUEST_DELAY_MS / 2);
                downloadWithRetry(imgUrl, imgFile);

                img.attr("src", "/images/" + imgName);
                updateContentImageReferences(content, imgUrl, imgName);

                downloadedImages.add(imgUrl);
                count++;
            } catch (Exception e) {
                log("Warning: Failed to download image: " + e.getMessage());
            }
        }
        return count;
    }

    private static String resolveImageUrl(Element img) {
        String imgUrl = img.attr("abs:src");
        if (imgUrl.isEmpty()) {
            imgUrl = img.attr("abs:data-src");
        }
        if (imgUrl.isEmpty()) {
            imgUrl = img.attr("abs:data-lazy-src");
        }
        if (imgUrl.isEmpty()) {
            imgUrl = img.attr("abs:srcset");
            if (!imgUrl.isEmpty()) {
                imgUrl = imgUrl.split(" ")[0];
            }
        }
        return imgUrl;
    }

    private static String sanitizeImageName(String imgUrl) {
        String imgName;
        try {
            imgName = new File(new URL(imgUrl).getPath()).getName();
        } catch (Exception e) {
            imgName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
        }

        imgName = imgName.replaceAll("\\?.*$", "")
            .replaceAll("%[0-9A-F]{2}", "-")
            .replaceAll("[^a-zA-Z0-9.-]", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "")
            .toLowerCase();

        if (imgName.isEmpty() || !imgName.contains(".")) {
            imgName = "image-" + System.currentTimeMillis() + ".jpg";
        }
        return imgName;
    }

    private static void downloadWithRetry(String imgUrl, File imgFile) throws Exception {
        for (int retry = 0; retry < IMAGE_RETRY_COUNT; retry++) {
            try {
                FileUtils.copyURLToFile(new URL(imgUrl), imgFile, CONNECTION_TIMEOUT_MS, CONNECTION_TIMEOUT_MS);
                return;
            } catch (Exception e) {
                if (retry == IMAGE_RETRY_COUNT - 1) {
                    throw e;
                }
                log("Retry " + (retry + 1) + " for image: " + imgUrl);
                sleep(1000);
            }
        }
    }

    private static void updateImageReferences(Element img, Element content, String imgUrl, String imgName) {
        img.attr("src", "images/" + imgName);
        String urlWithoutScheme = imgUrl.replace("https://", "").replace("http://", "");
        for (Element contentImg : content.select("img[src*='" + urlWithoutScheme + "']")) {
            contentImg.attr("src", "images/" + imgName);
        }
    }

    private static void updateContentImageReferences(Element content, String imgUrl, String imgName) {
        String urlWithoutScheme = imgUrl.replace("https://", "").replace("http://", "");
        for (Element contentImg : content.select("img")) {
            if (contentImg.attr("src").contains(urlWithoutScheme)) {
                contentImg.attr("src", "/images/" + imgName);
            }
        }
    }

    private static String extractPublishDate(Element content, Document doc, String url) {
        Elements dateElements = content.select("time[datetime], .entry-date, .published, .post-date, meta[property='article:published_time']");
        String publishDate = null;

        if (!dateElements.isEmpty()) {
            publishDate = dateElements.first().attr("datetime");
            if (publishDate == null || publishDate.isEmpty()) {
                publishDate = dateElements.first().attr("content");
            }
            if (publishDate == null || publishDate.isEmpty()) {
                publishDate = dateElements.first().text();
            }
        }

        if (publishDate == null || publishDate.isEmpty()) {
            Elements metaDates = doc.select("meta[property='article:published_time'], meta[name='publish_date'], meta[name='date']");
            if (!metaDates.isEmpty()) {
                publishDate = metaDates.first().attr("content");
            }
        }

        if (publishDate == null || publishDate.isEmpty()) {
            java.util.regex.Pattern urlDatePattern = java.util.regex.Pattern.compile("/(\\d{4})/(\\d{2})/(\\d{2})/");
            java.util.regex.Matcher matcher = urlDatePattern.matcher(url);
            if (matcher.find()) {
                publishDate = matcher.group(1) + "-" + matcher.group(2) + "-" + matcher.group(3);
            }
        }

        if (publishDate == null || publishDate.isEmpty()) {
            String fileDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
            publishDate = fileDate + "T00:00:00+00:00";
            log("Warning: Could not extract publication date for " + url + ", using current date");
        }

        return publishDate;
    }

    private static String extractFileDate(String publishDate) {
        if (publishDate.length() >= 10) {
            return publishDate.substring(0, 10);
        }
        return publishDate;
    }

    private static String extractFeaturedImage(Element content) {
        Elements articleImages = content.select("img");
        if (!articleImages.isEmpty()) {
            String firstImageUrl = articleImages.first().attr("src");
            if (!firstImageUrl.isEmpty() && (firstImageUrl.endsWith(".jpg") ||
                firstImageUrl.endsWith(".jpeg") || firstImageUrl.endsWith(".png") ||
                firstImageUrl.endsWith(".webp"))) {
                String imageName = firstImageUrl.substring(firstImageUrl.lastIndexOf('/') + 1);
                if (imageName.contains("?")) {
                    imageName = imageName.substring(0, imageName.indexOf('?'));
                }
                return "/images/" + imageName;
            }
        }
        return null;
    }

    private static List<String> extractTags(Document doc) {
        List<String> tags = new ArrayList<>();
        Elements tagLinks = doc.select("a[href*='/tag/']");
        for (Element tagLink : tagLinks) {
            String tagHref = tagLink.attr("href");
            if (tagHref.contains("/tag/")) {
                String tag = tagHref.substring(tagHref.lastIndexOf("/tag/") + 5);
                if (tag.endsWith("/")) {
                    tag = tag.substring(0, tag.length() - 1);
                }
                tag = tag.replace("-", " ");
                if (!tag.isEmpty() && !tags.contains(tag)) {
                    tags.add(tag);
                }
            }
        }
        return tags;
    }

    private static String escapeYamlString(String value) {
        if (value.contains("'")) {
            return "'" + value.replace("'", "''") + "'";
        }
        return "'" + value + "'";
    }

    private static String buildFrontMatter(String title, String url, String publishDate,
                                           String featuredImage, List<String> tags) {
        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        sb.append("layout: post\n");
        sb.append("title: ").append(escapeYamlString(title)).append('\n');
        sb.append("original_url: '").append(url).append("'\n");
        sb.append("date_published: '").append(publishDate).append("'\n");
        sb.append("date_scraped: '").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("'\n");
        if (featuredImage != null) {
            sb.append("featured_image: '").append(featuredImage).append("'\n");
        }
        if (!tags.isEmpty()) {
            sb.append("tags: ").append(tags).append('\n');
        }
        sb.append("---\n\n");
        return sb.toString();
    }
}