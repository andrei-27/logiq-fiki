const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'm5-attribution.js'), 'utf8');
const base = 'https://andrei-27.github.io/logiq-fiki/';
function tab() {
  const items = new Map();
  return {getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value)};
}
function visit(relative, sessionStorage, destinations = []) {
  const location = new URL(relative, base);
  const links = destinations.map(href => ({href: new URL(href, location).href}));
  const window = {};
  vm.runInNewContext(script, {window, location, URL, URLSearchParams, sessionStorage,
    document: {querySelectorAll: () => links}});
  return {campaign: {...window.logiqM5Campaign}, links: links.map(link => link.href)};
}

test('a new tagged entry replaces the entire previous campaign, including omitted fields', () => {
  const storage = tab();
  visit('landing.html?utm_source=university&utm_medium=community&utm_campaign=society&utm_content=event', storage);
  const {campaign} = visit('landing.html?utm_source=online&utm_medium=social', storage);
  assert.deepEqual(campaign, {campaign_source: 'online', campaign_medium: 'social',
    campaign_name: 'm5_validation_2', campaign_content: 'default'});
  assert.deepEqual(visit('landing.html#early-access', storage).campaign, campaign);
});

test('a demo round trip retains valid campaign tags without browser storage', () => {
  const unavailable = () => { throw new Error('Storage unavailable'); };
  const storage = {getItem: unavailable, setItem: unavailable};
  const start = visit('landing.html?utm_source=personal&utm_medium=message&utm_content=bad%40tag',
    storage, ['news.html', '#early-access', 'https://other.example/news.html']);
  const demo = visit(start.links[0], storage, ['landing.html#early-access']);
  const returned = visit(demo.links[0], storage);
  assert.equal(new URL(demo.links[0]).hash, '#early-access');
  assert.equal(returned.campaign.campaign_source, 'personal');
  assert.equal(returned.campaign.campaign_medium, 'message');
  assert.equal(returned.campaign.campaign_content, 'default');
  assert.equal(new URL(start.links[1]).searchParams.has('utm_campaign'), false);
  assert.equal(start.links[2], 'https://other.example/news.html');
});

test('an untagged or malformed source is not credited with a campaign channel', () => {
  for (const suffix of ['', '?utm_medium=social', '?utm_source=invalid%40example.org']) {
    assert.equal(visit(`landing.html${suffix}`, tab()).campaign.campaign_source, 'direct');
  }
});
