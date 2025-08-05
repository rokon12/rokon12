---
title: 'Java Tips # 01 – Writing Shebang Scripts in Pure Java'
original_url: 'https://bazlur.ca/2024/10/27/java-tips-01-writing-shebang-scripts-in-pure-java/'
date_published: '2024-10-27T00:00:00+00:00'
date_scraped: '2025-08-05T14:10:57.634713'
featured_image: 'images/dall-e-2024-10-27-02.06.37-a-feature-photo-illustrating-the-concept-of-writing-a-java-cli-shebang-script.-the-image-shows-a-terminal-window-with-java-code-being-executed-in-a-sh.webp'
---

![](images/dall-e-2024-10-27-02.06.37-a-feature-photo-illustrating-the-concept-of-writing-a-java-cli-shebang-script.-the-image-shows-a-terminal-window-with-java-code-being-executed-in-a-sh.webp)

Java Tips # 01 -- Writing Shebang Scripts in Pure Java
======================================================

Did you know you can write a CLI script in Java just as easily as you would in a bash script, and run it directly from the shell? This is commonly called a shebang script, though we are mostly familiar with writing them in bash. Bash scripts are great, but they can be obscure to developers who aren't familiar with the syntax. As a Java developer, you'd likely prefer to get things done the Java way. Well, since Java 11, you can do exactly that!

I'll assume Java is already installed on your machine. To confirm, open your terminal and run:

`java `--version  

You should see something like this:

```
java --version
java 21.0.1 2023-10-17 LTS
Java(TM) SE Runtime Environment (build 21.0.1+12-LTS-29)
Java HotSpot(TM) 64-Bit Server VM (build 21.0.1+12-LTS-29, mixed mode, sharing)
```

If you don't see a similar output, it means Java isn't installed. Sorry to make you uncomfortable, but you'll need to install it now! The easiest way is through [SDKMan](https://sdkman.io/).

In one of my previous articles, I explained how to build CLI applications with [PicoCLI](/2024/07/18/creating-a-command-line-tool-with-jbang-and-picocli-to-generate-release-notes/). If you're interested, feel free to check that out. But in this article, we'll keep it simple, using plain Java with no external libraries.

### Getting Started {#getting-started}

First, create a new file called `hello.java`:

```
touch hello.java
```

Then, paste the following code into the file:  

```
#!/usr/bin/java --source 21

import java.time.LocalDate;
import java.util.Random;
import java.util.Scanner;

public class HelloCLI {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();
        System.out.println("Welcome to the Java CLI. Type 'help' for a list of commands or 'exit' to quit.");

        while (true) {
            System.out.print("Command> ");
            String command = scanner.nextLine().trim().toLowerCase();

            switch (command) {
                case "greet" -> System.out.println("Hello, Java enthusiast!");
                case "date" -> System.out.println("Today's date: " + LocalDate.now());
                case "time" -> System.out.println("Current time: " + java.time.LocalTime.now());
                case "random" -> System.out.println("Random number (1-100): " + (random.nextInt(100) + 1));
                case "add" -> {
                    System.out.print("Enter first number: ");
                    double num1 = scanner.nextDouble();
                    System.out.print("Enter second number: ");
                    double num2 = scanner.nextDouble();
                    scanner.nextLine(); // Consume the newline
                    System.out.println("Result: " + (num1 + num2));
                }
                case "multiply" -> {
                    System.out.print("Enter first number: ");
                    double num1 = scanner.nextDouble();
                    System.out.print("Enter second number: ");
                    double num2 = scanner.nextDouble();
                    scanner.nextLine(); // Consume the newline
                    System.out.println("Result: " + (num1 * num2));
                }
                case "help" -> {
                    System.out.println("""
                        Available commands:
                        - greet: Prints a friendly greeting.
                        - date: Displays today's date.
                        - time: Displays the current time.
                        - random: Generates a random number between 1 and 100.
                        - add: Adds two numbers.
                        - multiply: Multiplies two numbers.
                        - help: Shows this help message.
                        - exit: Exits the program.
                        """);
                }
                case "exit" -> {
                    System.out.println("Exiting... Goodbye!");
                    return; // Terminate the program
                }
                default -> System.out.println("Unknown command: " + command + ". Type 'help' for a list of commands.");
            }
        }
    }
}
```

### Key Point: Shebang Line {#key-point-shebang-line}

Notice the first line: `#!/usr/bin/java --source 21`. This is the crucial part of the file, instructing the shell to use Java to run the script in source form using Java 21.

You can remove the `.java` extension if you want; that's also fine. Just keep the file named `hello`. To rename the file, use the following command:  

```
mv hello.java hello
```

### Make It Executable {#make-it-executable}

Now, to make this script executable, run the following command:

```
chmod +x ./hello
```

That's it! You can now run it with:

```
./hello
```

Here's what you should see when you run it:  

```
./hello
Welcome to the Java CLI. Type 'help' for a list of commands or 'exit' to quit.
Command> help
Available commands:
- greet: Prints a friendly greeting.
- date: Displays today's date.
- time: Displays the current time.
- random: Generates a random number between 1 and 100.
- add: Adds two numbers.
- multiply: Multiplies two numbers.
- help: Shows this help message.
- exit: Exits the program.

Command> greet
Hello, Java enthusiast!
Command> date
Today's date: 2024-10-27
Command> random
Random number (1-100): 99
Command> add
Enter first number: 5
Enter second number: 39999
Result: 40004.0
Command> exit
Exiting... Goodbye!
```

### Bonus Tip: Running From Anywhere {#bonus-tip-running-from-anywhere}

If you'd like to run this script from anywhere on your machine, simply move the file to the `/usr/local/bin/` folder:

```lang-bash
sudo mv ./hello /usr/local/bin/
```

Now, you can invoke it from any directory just by typing `hello` in your terminal.  

*** ** * ** ***

Type your email... {#subscribe-email}
