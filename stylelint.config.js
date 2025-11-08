module.exports = {
  extends: "stylelint-config-standard",
  rules: {
    "indentation": 2,
    "color-hex-length": "short",
    "string-quotes": "double",
    "block-no-empty": true,
    "unit-allowed-list": ["em", "rem", "%", "s", "px"],
  },
};