

console.log("test !!!");

var RecaptchaState = {
    site : '6Lf6I84SAAAAANEd0hwYTV--kfFLiJzUilhdXlu7',
    rtl : false,
    challenge : '03AHJ_VuuGYMjvX27aJZ8Mf-bz2l6w57VnyI0OFcZEQnzBabaOVnVpPywn-pjE1EeLLinOez3rIru-fDoVgbvMoYDo7FweXO40Z2k5iI-kPhz5AJdWRLw6Hrllfh7Nv2yWFm2Df9qPitEJtMfXnQNXX8aynA6mKCxAKw',
    is_incorrect : false,
    programming_error : '',
    error_message : '',
    server : 'http://www.google.com/recaptcha/api/',
    lang : 'en',
    timeout : 1800
};

document.write('<scr'+'ipt type="text/javascript" s'+'rc="' + RecaptchaState.server + 'js/recaptcha.js"></scr'+'ipt>');