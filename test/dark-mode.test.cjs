const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const script = readFileSync(join(__dirname, '../Zhihu-Beautification.user.js'), 'utf8');

function runScript({ cookies = '', hostname = 'www.zhihu.com', pathname = '/question/1/answer/2', browserDark = false, settings = {} } = {}) {
    const values = new Map(Object.entries({ menu_hideTitle: false, ...settings }));
    const attributes = new Map();
    const writes = [];
    const style = {};
    let reloads = 0;
    const root = {
        setAttribute: (name, value) => attributes.set(name, value),
        appendChild: element => element
    };
    runInNewContext(script, {
        document: {
            get cookie() { return cookies; },
            set cookie(value) { writes.push(value); },
            lastChild: root,
            documentElement: root,
            createElement: () => style
        },
        location: { hostname, pathname, reload: () => reloads++ },
        navigator: { userAgent: 'Chrome' },
        window: { matchMedia: () => ({ matches: browserDark }) },
        GM_getValue: key => values.get(key),
        GM_setValue: (key, value) => values.set(key, value),
        GM_registerMenuCommand: () => 1
    });
    return { writes, theme: attributes.get('data-theme'), reloads, css: style.textContent };
}

function assertClearedTheme({ writes, theme, reloads }) {
    assert.equal(writes.length, 1);
    assert.match(writes[0], /^themeApp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=\/; domain=\.zhihu\.com$/);
    assert.equal(theme, 'light');
    assert.equal(reloads, 1);
}

test('默认方案忽略旧 Cookie，并为知乎各子域名写入深色主题', () => {
    const result = runScript({ cookies: 'theme=dark' });
    assert.equal(result.writes.length, 1);
    assert.match(result.writes[0], /^themeApp=dark; expires=[^;]+; path=\/; domain=\.zhihu\.com$/);
    assert.equal(result.theme, 'dark');
    assert.equal(result.reloads, 1);
    assert.match(result.css, /html\[data-theme=dark\] body/);
    assert.match(result.css, /\.QuestionPage > div:has\(\.Question-mainColumn\) \{width: 1000px !important;/);
});

test('专栏读取已设为深色的共享 Cookie，不再刷新', () => {
    const result = runScript({ cookies: 'theme=light; themeApp=dark', hostname: 'zhuanlan.zhihu.com', pathname: '/p/123' });
    assert.deepEqual(result.writes, []);
    assert.equal(result.reloads, 0);
    assert.match(result.css, /html\[data-theme=dark\] \.Post-content/);
});

test('关闭暗黑模式时清除共享的深色主题', () => {
    assertClearedTheme(runScript({ cookies: 'themeApp=dark', settings: { menu_darkMode: false } }));
});

test('跟随浏览器时，浅色会清除主题，深色会启用默认方案', () => {
    const settings = { menu_darkModeAuto: true };
    assertClearedTheme(runScript({ cookies: 'themeApp=dark', settings }));
    assert.equal(runScript({ browserDark: true, settings }).theme, 'dark');
});

test('方案 2–4 清除知乎深色主题，保留各自的滤镜', () => {
    const filters = ['invert(90%)', 'brightness(70%)', 'brightness(65%) sepia(30%)'];
    for (const [index, filter] of filters.entries()) {
        const result = runScript({ cookies: 'themeApp=dark', settings: { menu_darkModeType: index + 2 } });
        assertClearedTheme(result);
        assert.ok(result.css.includes(`html {filter: ${filter} !important;`));
    }
});
