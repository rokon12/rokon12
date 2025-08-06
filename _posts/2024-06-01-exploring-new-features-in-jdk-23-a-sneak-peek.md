---
layout: post
title: 'Exploring New Features in JDK 23: A Sneak Peek'
original_url: 'https://bazlur.ca/2024/06/01/exploring-new-features-in-jdk-23-a-sneak-peek/'
date_published: '2024-06-01T00:00:00+00:00'
date_scraped: '2025-08-05T22:23:18.2978'
featured_image: '/images/dall-e-2024-05-31-04.10.40-an-elegant-and-simple-illustration-of-a-java-developer-working-on-a-computer-with-a-screen-displaying-a-jdk-23-code-example.-the-background-is-minimal.webp'
tags: [ai, chat memory, chatbots, java, langchain4j, llm, summarization, token management, devotion, gratitude, humility, islamic pilgrimage, madinah, makkah, messenger muhammad %ef%b7%ba, rawda, sacred cities, spiritual journey, umrah, unity, bash alternative, cli script, command line, dark mode, developer tools, java 11, java 21, java cli, java code, java development, java execution, java features, java scripting, java shebang, java shell script, java tips, java tricks, java tutorial, shebang, terminal script, architecture, bicycle friendly, big ben, buckingham palace, city exploration, conference, copenhagen, cultural experiences, developer festivals, europe, family bonding, family reunion, frederiksborg castle, helsingborg, here are some recommended tags for your trip report london, history, karnan castle, nyhavn, old cities, personal journey, prime meridian, professional highlights, scandinavia, tivoli gardens, travel, travel blog, automation, cli, devops, github, jbang, picocli, releasenotes, tutorial, foreign function memory api, jep 471, memory management, security, sun misc unsafe, varhandle, code efficiency, code readability, coding best practices, core java, java enhancements, java programming, jep 455, modern java, order processing, primitive type, programming tips, software development, sure here are some tags for your article java, switch expressions, switch pattern, switch statement, jep, main, println, clarity, cleaner code, error handling, expressiveness, java records, junit 5, maintainability, parameterized testing, test cases, type safety, baby, dhaka, homecoming, new job]
---

![](images/dall-e-2024-05-31-04.10.40-an-elegant-and-simple-illustration-of-a-java-developer-working-on-a-computer-with-a-screen-displaying-a-jdk-23-code-example.-the-background-is-minimal.webp)

Exploring New Features in JDK 23: A Sneak Peek
==============================================

### The main method and println

With JDK 23 on the horizon, I decided to dive into some of its new features by running the following code in the CLI:

```
void main() {
    println("Hello World");

    var name = readln("Enter your name: ");
    println("Your name is " + name);

    var age = readln("Enter your age: ");
    println("Your age is " + age);
}
```

All I did is, I create a file named. `Main.java`. Then run the following command:

`java --enable-preview --source 23 Main.java`

Here is the output:

    Hello World
    Enter your name: Bazlur
    Your name is Bazlur
    Enter your age: 60
    Your age is 60

One key observation is that `readln` captures input as strings without automatic type conversion, unlike Python. This behavior is expected but worth noting. Although this feature is still in the preview phase, it shows great potential for future enhancements.

### The New java.io.IO Class

The new [java.io.IO](https://github.com/openjdk/jdk/blob/jdk-23%2B25/src/java.base/share/classes/java/io/IO.java) class introduces three additional methods: `println`, print, and readln, which are automatically imported. This makes it easier for beginners as there's no need for extra import statements.

### Downloading JDK 23

Since JDK 23 isn't officially available yet, the Early-Access Builds version is available through SDKMAN, which makes it easier to manage and install. I have installed the `23.ea.25-open`

If you don't have SDKMAN, use this [resource](https://sdkman.io/install#:~:text=It%20effortlessly%20sets%20up%20on,both%20Bash%20and%20ZSH%20shells.) to download and install it. Besides SDKMAN, the OpenJDK JDK 23 Early-Access Builds are available [here](https://jdk.java.net/23/).

### Conclusion

The upcoming JDK 23 release promises to introduce convenient features for developers, particularly beginners. The new IO class is a great example, simplifying input and output operations. As we await the official release, building from the source gives us an exciting preview of what's to come.

More about this can be found here: <https://www.infoq.com/news/2024/05/jep477-implicit-classes-main/>  

*** ** * ** ***

