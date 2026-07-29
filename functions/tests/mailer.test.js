const test = require("node:test");
const assert = require("node:assert/strict");

const { escapeHtml } = require("../lib/mailer");

test("escapeHtml escapes all HTML-significant characters", () => {
  assert.equal(
    escapeHtml(`<script>alert('hi & "bye"')</script>`),
    "&lt;script&gt;alert(&#39;hi &amp; &quot;bye&quot;&#39;)&lt;/script&gt;"
  );
});

test("escapeHtml passes plain text through unchanged", () => {
  assert.equal(escapeHtml("Νίκος wants a mobile app"), "Νίκος wants a mobile app");
});

test("escapeHtml coerces non-string input instead of throwing", () => {
  assert.equal(escapeHtml(42), "42");
});
