// Share functionality — extracted from share-buttons.html
(function() {
  'use strict';

  window.shareOnTwitter = function(title, url) {
    var text = encodeURIComponent(title);
    var shareUrl = encodeURIComponent(url);
    window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + shareUrl, '_blank', 'width=550,height=450');
  };

  window.shareOnLinkedIn = function(title, url) {
    var shareUrl = encodeURIComponent(url);
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl, '_blank', 'width=550,height=450');
  };

  window.shareOnReddit = function(title, url) {
    var shareTitle = encodeURIComponent(title);
    var shareUrl = encodeURIComponent(url);
    window.open('https://www.reddit.com/submit?title=' + shareTitle + '&url=' + shareUrl, '_blank', 'width=850,height=550');
  };

  window.shareOnHackerNews = function(title, url) {
    var shareTitle = encodeURIComponent(title);
    var shareUrl = encodeURIComponent(url);
    window.open('https://news.ycombinator.com/submitlink?t=' + shareTitle + '&u=' + shareUrl, '_blank', 'width=550,height=450');
  };

  window.shareViaEmail = function(title, url) {
    var subject = encodeURIComponent('Check out: ' + title);
    var body = encodeURIComponent('I thought you might find this interesting:\n\n' + title + '\n' + url + '\n\nFrom Bazlur\'s Archive');
    window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
  };

  window.copyToClipboard = function(url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        showToast('Link copied to clipboard!');
        animateCopyButton();
      });
    } else {
      var temp = document.createElement('input');
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
        animateCopyButton();
      } catch (err) {
        showToast('Failed to copy link');
      }
      document.body.removeChild(temp);
    }
  };

  window.nativeShare = function(title, text, url) {
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function() {});
    } else {
      window.copyToClipboard(url);
    }
  };

  function showToast(message) {
    var toast = document.getElementById('share-toast');
    if (!toast) return;
    var toastMessage = toast.querySelector('.share-toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
  }

  function animateCopyButton() {
    var copyButton = document.querySelector('.share-copy');
    if (!copyButton) return;
    copyButton.classList.add('copied');
    var span = copyButton.querySelector('span');
    var originalText = span.textContent;
    span.textContent = 'Copied!';
    setTimeout(function() {
      copyButton.classList.remove('copied');
      span.textContent = originalText;
    }, 2000);
  }

  // Show native share button only on mobile with share API support
  document.addEventListener('DOMContentLoaded', function() {
    var nativeButton = document.querySelector('.share-native');
    if (!nativeButton) return;
    if (!navigator.share || window.innerWidth > 768) {
      nativeButton.style.display = 'none';
    }
  });
})();