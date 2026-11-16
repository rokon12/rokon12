# Run after the complete site build: bundle exec ruby -rbundler/setup scripts/check-seo.rb PATH
require 'nokogiri'
require 'json'
require 'uri'
require 'yaml'
require 'date'

root = File.expand_path(ARGV.fetch(0, '_site'))
site_url = YAML.safe_load(File.read('_config.yml'))['url']
errors = []
check = ->(condition, message) { errors << message unless condition }
resolve = lambda do |url|
  raw_path = url.start_with?('/') ? url.split(/[?#]/).first : URI(url).path
  path = URI::DEFAULT_PARSER.unescape(raw_path)
  file = File.join(root, path.sub(%r{^/}, ''))
  file = File.join(file, 'index.html') if path.end_with?('/')
  file
end

sitemap = Nokogiri::XML(File.read(File.join(root, 'sitemap.xml')))
urls = sitemap.xpath('//*[local-name()="loc"]').map(&:text)
check.call(urls.uniq == urls, 'Duplicate sitemap URLs')
check.call(urls.none? { |url| url.match?(%r{/(backup/|search/|404\.html|offline\.html|image-optimization-test\.html|responsive-test\.html|test-[^/]+\.html)}) }, 'Noncanonical or utility page in sitemap')

urls.each do |url|
  check.call(File.file?(resolve.call(url)), "Missing sitemap target: #{url}")
end

articles = 0
Dir[File.join(root, '**/*.html')].each do |file|
  doc = Nokogiri::HTML(File.read(file))
  next unless doc.at_css('.article-wrap')
  label = file.sub(root, '')
  ['title', 'meta[name="description"]', 'link[rel="canonical"]', 'meta[property="og:image"]', 'meta[name="twitter:image"]'].each do |selector|
    check.call(doc.css(selector).size == 1, "#{label}: expected exactly one #{selector}")
  end
  canonical = doc.at_css('link[rel="canonical"]')['href']
  check.call(canonical.start_with?(site_url + '/'), "#{label}: wrong canonical host")
  description = doc.at_css('meta[name="description"]')['content']
  check.call(!description.to_s.strip.empty?, "#{label}: empty description")
  image = doc.at_css('meta[property="og:image"]')['content']
  check.call(image == doc.at_css('meta[name="twitter:image"]')['content'], "#{label}: conflicting social images")
  check.call(File.file?(resolve.call(image)), "#{label}: missing social image") if image.start_with?(site_url + '/')
  records = doc.css('script[type="application/ld+json"]').map { |script| JSON.parse(script.text) }
  next unless doc.at_css('.post-content')
  articles += 1
  postings = records.select { |record| record['@type'] == 'BlogPosting' }
  check.call(postings.size == 1, "#{label}: duplicate/missing BlogPosting")
  check.call(postings.first['image'] == image, "#{label}: conflicting structured image")
  check.call(postings.first['url'] == canonical, "#{label}: conflicting structured URL")
  check.call(doc.css('h1').size == 1, "#{label}: duplicate/missing article H1")
  doc.css('picture source[srcset]').each do |source|
    source['srcset'].split(',').each do |candidate|
      check.call(File.file?(resolve.call(candidate.strip.split.first)), "#{label}: missing responsive asset #{candidate}")
    end
  end
end
check.call(articles == Dir['_posts/*.md'].size, 'One or more articles disappeared from the build')

Dir['_posts/*.md'].each do |file|
  data = YAML.safe_load(File.read(file).split(/^---\s*$/, 3)[1], permitted_classes: [Date, Time], aliases: true)
  Array(data['redirect_from']).each do |old_path|
    redirect_file = resolve.call(old_path)
    check.call(File.file?(redirect_file), "Missing redirect: #{old_path}")
    next unless File.file?(redirect_file)
    redirect = Nokogiri::HTML(File.read(redirect_file))
    target = redirect.at_css('link[rel="canonical"]')&.[]('href')
    check.call(target && urls.include?(target), "Redirect target is not canonical: #{old_path}")
    check.call(redirect.at_css('meta[http-equiv="refresh"]')&.[]('content') == "0; url=#{target}", "Delayed or broken redirect: #{old_path}")
  end
end

%w[search/index.html 404.html offline.html].each do |file|
  doc = Nokogiri::HTML(File.read(File.join(root, file)))
  check.call(doc.at_css('meta[name="robots"]')['content'].include?('noindex'), "#{file}: missing noindex")
end
%w[image-optimization-test.html responsive-test.html test-related-posts.html archive-backup.zip WebsiteScraper.java].each do |file|
  check.call(!File.exist?(File.join(root, file)), "Development file shipped: #{file}")
end
Dir[File.join(root, 'topics/**/*.html')].each do |file|
  doc = Nokogiri::HTML(File.read(file))
  check.call(doc.css('.reading-path li').size >= 3, "#{file}: missing curated reading path")
  doc.css('.reading-path a').each { |a| check.call(File.file?(resolve.call(a['href'])), "Broken guide link: #{a['href']}") }
end

abort errors.join("\n") unless errors.empty?
puts "SEO checks passed: #{articles} articles, #{urls.size} sitemap URLs, valid redirects, consistent metadata, and responsive assets."
