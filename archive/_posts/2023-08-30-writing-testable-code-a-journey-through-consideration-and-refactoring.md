---
title: 'Writing Testable Code: A Journey Through Consideration and Refactoring'
original_url: 'https://bazlur.ca/2023/08/30/writing-testable-code-a-journey-through-consideration-and-refactoring/'
date_published: '2023-08-30T00:00:00+00:00'
date_scraped: '2025-02-15T11:26:04.628916284'
tags: ['testing', 'programming', 'tutorial']
featured_image: images/8a588ade-2fff-41d7-9407-1b10f524271d.jpeg
---

![](images/8a588ade-2fff-41d7-9407-1b10f524271d.jpeg)

Writing Testable Code: A Journey Through Consideration and Refactoring
======================================================================

**In an ideal world, every piece of code we write would be easily testable, clearly understood, and perfectly maintainable. However, reality often presents us with complex problems and solutions that aren't always straightforward. Writing testable code sometimes requires a thoughtful approach, deep consideration of the use cases, and even refactoring to ensure that the code is robust and fully tested.**

The Challenge of Testing
------------------------

Imagine a scenario where you need to create an Amazon S3 client based on different credential providers. At first glance, the implementation might seem simple. However, when it comes to writing unit tests for this code, challenges arise.

The initial implementation might include a method that builds the S3 client, choosing between different credentials providers based on the input parameters. While this code may function correctly, testing it becomes a problem. How do you verify which credentials provider was used? How do you isolate the code from the AWS SDK, which might require real AWS credentials?  


Let's see an example:

```
public AmazonS3 getAmazonS3Client(
        final String s3AccessKeyId, final String secretAccessKey, final Regions region) {
    final AWSCredentialsProvider credentialsProvider;
    if (StringUtils.isNotEmpty(s3AccessKeyId) && StringUtils.isNotEmpty(secretAccessKey)) {
        credentialsProvider =
                new AWSStaticCredentialsProvider(new BasicAWSCredentials(s3AccessKeyId, secretAccessKey));
    } else {
        credentialsProvider = new DefaultAWSCredentialsProviderChain();
    }

    return AmazonS3ClientBuilder.standard()
            .withCredentials(credentialsProvider)
            .withRegion(region)
            .build();
}
```

The Process of Refactoring
--------------------------

Recognizing that the code is hard to test, the next step is to consider how it can be refactored to make testing easier. This often involves identifying the dependencies and behaviours that are hard to test and finding ways to isolate them.

In our example, the challenge was verifying the code's behaviour based on different credentials providers.  


The solution can be by introducing an interface and separate implementations for the different scenarios. This allowed the behaviour to be tested in isolation without having to know the internal details of the Amazon S3 client.

This refactoring process involved several steps:

* **Identifying the Problem:** Recognizing that the code was hard to test and understanding why.
* **Designing a Solution:** Introducing an interface and separate implementations to isolate the behaviour.
* **Implementing the Changes:** Refactoring the code to use the new design.
* **Writing the Tests:** Creating unit tests that cover all code paths and may ensure 100% coverage.

Here's the refactored code:

```
interface AmazonS3ClientFactory {
    AmazonS3 getAmazonS3Client(String s3AccessKeyId, String secretAccessKey, Regions region);
}

static class AWSStaticCredentialsProviderS3ClientFactory implements AmazonS3ClientFactory {
    @Override
    public AmazonS3 getAmazonS3Client(String s3AccessKeyId, String secretAccessKey, Regions region) {
        return AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(new BasicAWSCredentials(s3AccessKeyId, secretAccessKey)))
                .withRegion(region)
                .build();
    }
}

static class DefaultAWSCredentialsProviderChainS3ClientFactory implements AmazonS3ClientFactory {
    @Override
    public AmazonS3 getAmazonS3Client(String s3AccessKeyId, String secretAccessKey, Regions region) {
        return AmazonS3ClientBuilder.standard()
                .withCredentials(new DefaultAWSCredentialsProviderChain())
                .withRegion(region)
                .build();
    }
}


AmazonS3 getAmazonS3Client(
        final String s3AccessKeyId, final String secretAccessKey, final Regions region) {
    if (StringUtils.isNotEmpty(s3AccessKeyId) && StringUtils.isNotEmpty(secretAccessKey)) {
        return new AWSStaticCredentialsProviderS3ClientFactory().getAmazonS3Client(s3AccessKeyId, secretAccessKey, region);
    } else {
        return new DefaultAWSCredentialsProviderChainS3ClientFactory().getAmazonS3Client(s3AccessKeyId, secretAccessKey, region);
    }
}
```

This refactoring allowed the behaviour to be tested in isolation without having to know the internal details of the Amazon S3 client.

Writing the Tests
-----------------

With the code refactored, we can now write unit tests that cover all code paths and ensure 100% coverage. Here are the specific tests:

### Test the AWS Static Credentials Provider Factory

This test ensures that the factory for creating an S3 client with static credentials works correctly.

```
@Test
public void shouldUseAWSStaticCredentialsProvider_whenKeysProvided() {
  var factory = new AgentAttackEventS3Operations.AWSStaticCredentialsProviderS3ClientFactory();
  AmazonS3 s3Client = factory.getAmazonS3Client(S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION);
  assertThat(s3Client).isNotNull();
  assertEquals(REGION.getName(), s3Client.getRegionName());
}
```

### Test the Default AWS Credentials Provider Factory

This test ensures that the factory for creating an S3 client with the default credentials provider works correctly.

```
@Test
public void shouldUseDefaultAWSCredentialsProvider_whenKeysNotProvided() {
  var factory =
      new AgentAttackEventS3Operations.DefaultAWSCredentialsProviderChainS3ClientFactory();
  AmazonS3 s3Client = factory.getAmazonS3Client(S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION);
  assertThat(s3Client).isNotNull();
  assertEquals(REGION.getName(), s3Client.getRegionName());
}
```

### Test the Choice of Credentials Provider Based on Input

These tests ensure that the correct factory is used based on the presence or absence of access keys.

```
@Test
public void shouldUseAWSStaticCredentials_whenKeysNotEmpty() {
  s3Operations.getAmazonS3Client(S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION);

  verify(awsStaticCredentialsProviderS3ClientFactory, times(1))
      .getAmazonS3Client(anyString(), anyString(), any(Regions.class));
  verify(defaultAWSCredentialsProviderChainS3ClientFactory, times(0))
      .getAmazonS3Client(anyString(), anyString(), any(Regions.class));
}

@Test
public void shouldUseDefaultAWSCredentials_whenKeysEmpty() {
  s3Operations.getAmazonS3Client("", "", REGION);

  verify(awsStaticCredentialsProviderS3ClientFactory, times(0))
      .getAmazonS3Client(anyString(), anyString(), any(Regions.class));
  verify(defaultAWSCredentialsProviderChainS3ClientFactory, times(1))
      .getAmazonS3Client(anyString(), anyString(), any(Regions.class));
}
```

These examples illustrate how refactoring the code to use an interface and separate implementations allows for thorough testing of the logic, including the choice of credentials provider based on the input parameters.

Lessons Learned and Conclusion
------------------------------

The journey from initial implementation to fully testable code teaches us to:

* **Consider Testability from the Start**
* **Don't Be Afraid to Refactor**
* **Use Tools Wisely**
* **Test Behavior, Not Implementation**

In the end, the journey toward testable code is one of continuous learning and improvement.

It's a path that leads to better code, better tests, and better software.

By considering real-world examples and learning from the process of refactoring and testing, we can create robust and maintainable code that stands the test of time.  

*** ** * ** ***

---

📬 **Stay Updated**: Subscribe to my newsletter at [bazlur.substack.com](https://bazlur.substack.com/) for more articles on Java, Software Architecture, and Technology.
