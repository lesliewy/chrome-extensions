(function () {
  var DownloadAudioVideoOption, bgSettings;
  extend1 = function (child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key))
        child[key] = parent[key];
    }
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  },

    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  bgSettings = chrome.extension.getBackgroundPage().Settings;
  $ = function (id) {
    return document.getElementById(id);
  };

  Option = (function () {
    console.log("option...");
    Option.all = [];

    function Option(field1, onUpdated1) {
      this.field = field1;
      this.onUpdated = onUpdated1;
      this.element = $(this.field);
      this.element.addEventListener("change", this.onUpdated);
      // this.fetch();
      Option.all.push(this);
    }

    Option.prototype.fetch = function () {
      this.populateElement(this.previous = bgSettings.get(this.field));
      return this.previous;
    };

    Option.prototype.save = function () {
      var value;
      value = this.readValueFromElement();
      if (JSON.stringify(value) !== JSON.stringify(this.previous)) {
        return bgSettings.set(this.field, this.previous = value);
      }
    };

    Option.prototype.restoreToDefault = function () {
      bgSettings.clear(this.field);
      return this.fetch();
    };

    Option.saveOptions = function () {
      return Option.all.map(function (option) {
        return option.save();
      });
    };

    return Option;

  })();

  DownloadAudioVideoOption = (function (superClass) {
    extend1(DownloadAudioVideoOption, superClass);
    console.log("DownloadAudioVideoOption1 ...")
    function DownloadAudioVideoOption() {
      console.log("DownloadAudioVideoOption2 ...");
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      DownloadAudioVideoOption.__super__.constructor.apply(this, args);
      $("downloadUrlsAddButton").addEventListener("click", (function (_this) {
        console.log("downloadUrlsAddButton add click...")
        return function (event) {
          console.log("downloadAudioVideoOption click...");
          return _this.addRule();
        };
      })(this));
    }

    DownloadAudioVideoOption.prototype.addRule = function (pattern) {
      var element, downloadUrlsScrollBox;
      if (pattern == null) {
        pattern = "";
      }
      element = this.appendRule({
        pattern: pattern
      });
      this.getPattern(element).focus();
      downloadUrlsScrollBox = $("downloadUrlsScrollBox");
      downloadUrlsScrollBox.scrollTop = downloadUrlsScrollBox.scrollHeight;
      this.onUpdated();
      return element;
    };

    DownloadAudioVideoOption.prototype.populateElement = function (rules) {
      var i, len, results, rule;
      results = [];
      for (i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];
        results.push(this.appendRule(rule));
      }
      return results;
    };

    DownloadAudioVideoOption.prototype.appendRule = function (rule) {
      var content, element, event, field, i, j, len, len1, ref, ref1, row;
      content = document.querySelector('#downloadUrlsRuleTemplate').content;
      row = document.importNode(content, true);
      ref = ["pattern"];
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        element = row.querySelector("." + field);
        element.value = rule[field];
        ref1 = ["input", "change"];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          event = ref1[j];
          element.addEventListener(event, this.onUpdated);
        }
      }
      this.getRemoveButton(row).addEventListener("click", (function (_this) {
        return function (event) {
          rule = event.target.parentNode.parentNode;
          rule.parentNode.removeChild(rule);
          return _this.onUpdated();
        };
      })(this));
      this.element.appendChild(row);
      return this.element.children[this.element.children.length - 1];
    };

    DownloadAudioVideoOption.prototype.readValueFromElement = function () {
      var element, rules;
      rules = (function () {
        var i, len, ref, results;
        ref = this.element.getElementsByClassName("downloadUrlsRuleTemplateInstance");
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          element = ref[i];
          results.push(this.getPattern(element).value.trim());
        }
        return results;
      }).call(this);
      return rules;
      /*
      return rules.filter(function (rule) {
        return rule.pattern;
      });
      */
    };

    DownloadAudioVideoOption.prototype.getPattern = function (element) {
      return element.querySelector(".pattern");
    };

    DownloadAudioVideoOption.prototype.getRemoveButton = function (element) {
      return element.querySelector(".downloadUrlsRemoveButton");
    };

    // 添加
    DownloadAudioVideoOption.prototype.save = function () {
      var value;
      value = this.readValueFromElement();
      chrome.storage.local.set({ allowedDownloadUrls: value }, function () {
      });
    }

    return DownloadAudioVideoOption;

  })(Option);
  Options = {
    downloadUrlsRules: DownloadAudioVideoOption
  };

  initOptionsPage = function () {
    var activateHelpDialog, element, i, len, maintainAdvancedOptions, maintainLinkHintsView, name, onUpdated, ref, saveOptions, toggleAdvancedOptions, type;
    onUpdated = function () {
      $("saveOptions").removeAttribute("disabled");
      return $("saveOptions").innerHTML = "Save Changes";
    };

    activateHelpDialog = function () {
      var request;
      request = {
        showUnboundCommands: true,
        showCommandNames: true,
        customTitle: "Command Listing"
      };
      return chrome.runtime.sendMessage(extend(request, {
        handler: "getHelpDialogHtml"
      }), function (response) {
        return HelpDialog.toggle({
          html: response
        });
      });
    };
    saveOptions = function () {
      Option.saveOptions();
      $("saveOptions").disabled = true;
      return $("saveOptions").innerHTML = "No Changes";
    };
    $("saveOptions").addEventListener("click", saveOptions);

    for (name in Options) {
      if (!hasProp.call(Options, name)) continue;
      type = Options[name];
      new type(name, onUpdated);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('pages/downloadUrls.html'), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        $("downloadUrlsScrollBox").innerHTML = xhr.responseText;
        switch (location.pathname) {
          case "/pages/options.html":
            return initOptionsPage();
          case "/pages/popup.html":
            return initPopupPage();
        }
      }
    };
    return xhr.send();
  });
}).call(this);
