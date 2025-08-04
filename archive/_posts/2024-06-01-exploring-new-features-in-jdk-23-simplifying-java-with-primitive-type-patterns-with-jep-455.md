---
title: 'Exploring New Features in JDK 23: Simplifying Java with Primitive Type Patterns with JEP 455'
original_url: 'https://bazlur.ca/2024/06/01/exploring-new-features-in-jdk-23-simplifying-java-with-primitive-type-patterns-with-jep-455/'
date_published: '2024-06-01T00:00:00+00:00'
date_scraped: '2025-02-15T11:25:11.523118447'
tags: ['java', 'tutorial']
featured_image: images/dall-e-2024-06-01-05.25.07-a-detailed-and-accurate-image-of-the-java-duke-mascot.-duke-is-a-triangular-character-with-a-white-body-black-arms-and-legs-and-a-red-nose.-the-ima.webp
---

![](images/dall-e-2024-06-01-05.25.07-a-detailed-and-accurate-image-of-the-java-duke-mascot.-duke-is-a-triangular-character-with-a-white-body-black-arms-and-legs-and-a-red-nose.-the-ima.webp)

Exploring New Features in JDK 23: Simplifying Java with Primitive Type Patterns with JEP 455
============================================================================================

Java continues to evolve, introducing features that streamline coding practices and improve readability. [JEP 455](https://openjdk.org/jeps/455) is one such proposal that enhances the switch statement, making it more versatile and expressive. This article delves into how JEP 455 can be utilized to handle complex decision-making scenarios more efficiently. We'll examine a practical example to illustrate the benefits of this feature.

### **What's New in JEP 455?**

This JEP introduces the following key features:

* **Primitive Type Patterns:** You can use primitive types (like int, long, boolean, etc.) directly within pattern-matching constructs. This eliminates the need for unnecessary boxing and unboxing of values.
* **Expanded** **instanceof** **and** **switch** **:** The instanceof operator and switch expressions have been extended to work seamlessly with primitive types.

### **Practical Example: User Order Processing**

Let's explore a practical example demonstrating how JEP 455 can be applied. We'll create a simple order processing system that distinguishes between logged-in and unrecognized users and processes their orders accordingly.

What I did here was create a file named OrderService.java and then put the following code.

```
void main() {
    var user = new User(12345L, true);  //loggedIn user
    startProcessing(OrderStatus.NEW, switch (user.loggedIn()) {
        case true -> user.id();
        case false -> {
            log("Unrecognized user");
            yield -1;
        }
    });

    user = new User(0L, false); //not loggedIn user
    startProcessing(OrderStatus.NEW, switch (user.loggedIn()) {
        case true -> user.id();
        case false -> {
            log("Unrecognized user");
            yield -1;
        }
    });
}

void startProcessing(OrderStatus orderStatus, long userId) {
    switch (userId) {
        case -1L -> System.out.println("Unrecognized User. Unable to process order.");
        default -> {
            var message = switch (orderStatus) {
                case NEW -> "Order for User %s is received and will start processing";
                case PROCESSING -> "Order for User %s is being processed.";
                case DISPATCHED, DELIVERED -> "Order for User %s has already been processed";
            };
            log(String.format(message, userId));
        }
    }
}

void log(String message) {
    println(message);
}
enum OrderStatus {
    NEW,
    PROCESSING,
    DISPATCHED,
    DELIVERED
}

record User(long id, boolean loggedIn) {
}

```

In this example, we create a User object with an ID and a loggedIn status. The switch expression inside the startProcessing method evaluates whether the user is logged in. If the user is logged in, their ID is used for processing; if not, a log message is generated, and -1 is yielded to indicate an unrecognized user. The startProcessing method then uses another switch statement to handle different OrderStatus values. Appropriate messages are printed depending on the order status, demonstrating the efficiency and clarity achieved using JEP 455. This nested switch usage showcases how the new expression syntax simplifies complex decision-making logic.

This code uses the instance main method and shorter `println` method that is available through JEP 477. More on JEP 477 can be found in this [infoQ story](https://www.infoq.com/news/2024/05/jep477-implicit-classes-main/):

**NOTE**: This is a [preview language feature](https://openjdk.org/jeps/12), available through the --enable-preview flag with the JDK 23 compiler and runtime. To try the examples above in JDK 23, you must enable the preview features:

* Compile the program with javac --release 23 --enable-preview OrderService.java and run it with java --enable-preview OrderService; or,
* When using the [source code launcher](https://openjdk.org/jeps/330), run the program with java --enable-preview OrderService.java; or,
* When using [jshell](https://openjdk.java.net/jeps/222), start it with jshell --enable-preview.

Since JDK 23 isn't officially available yet, the Early-Access Builds version is available through SDKMAN, which makes it easier to manage and install. I have installed the 23.ea.25-open

If you don't have SDKMAN, use this [resource](https://sdkman.io/install#:~:text=It%20effortlessly%20sets%20up%20on,both%20Bash%20and%20ZSH%20shells.) to download and install it. In addition to SDKMAN, the OpenJDK JDK 23 Early-Access Builds are available [here](https://jdk.java.net/23/).

### **Conclusion**

As Java continues to evolve, features like JEP 455 demonstrate the language's commitment to modernizing and improving developer productivity. Embrace these changes to write more efficient and readable code and stay ahead in the ever-evolving landscape of Java development. More about this JEP can be found here: <https://www.infoq.com/news/2024/02/java-enhances-pattern-matching/>  

*** ** * ** ***

---

📬 **Stay Updated**: Subscribe to my newsletter at [bazlur.substack.com](https://bazlur.substack.com/) for more articles on Java, Software Architecture, and Technology.
