const mathjax_static_config_identifying_property = 'this_is_initial_static_data';

const mathjax_static_config_js = `
'use strict';

// MathJax static configuration.
// This must be called before the MathJax code is loaded.
// See: https://docs.mathjax.org/en/v2.7-latest/config-files.html#the-tex-mml-am-chtml-configuration-file
globalThis.MathJax = {
jax: ["input/TeX","input/MathML","input/AsciiMath","output/CommonHTML"],
extensions: ["tex2jax.js","mml2jax.js","MathMenu.js","MathZoom.js"/*,"AssistiveMML.js"*/, "a11y/accessibility-menu.js"],
TeX: {
    extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
},
tex2jax: {
    inlineMath: [ ['$','$'] ],
    processEscapes: true,
},
displayAlign: 'left',
displayIndent: '0',
skipStartupTypeset: true,  // typeset must be performed explicitly
${mathjax_static_config_identifying_property}: true,  // used to detect when MathJax has replaced this initialization object with itself
};
`;
globalThis.core.create_inline_script(document.head, mathjax_static_config_js);

await globalThis.core.load_script(document.head, new URL('../../node_modules/marked/marked.min.js', import.meta.url));
await globalThis.core.load_script_and_wait_for_condition(document.head, new URL('../../node_modules/mathjax/latest.js', import.meta.url), () => {
        return !globalThis.MathJax[mathjax_static_config_identifying_property];
    });

export const marked  = globalThis.marked;
export const MathJax = globalThis.MathJax;

// We are currently using MathJax v2.7.x instead of v3.x.x because
// Plotly (used as an output handler) still requires the older version.
// We want to upgrade to MathJax 3.x when Plotly supports it.
export const is_MathJax_v2 = !MathJax.startup;  // MathJax.startup is not defined before version 3
