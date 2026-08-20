//here we manually creates tags and insert the js into the final html.

//for google analytics
var gaMeasurementId = 'G-XZ3M0DQJ6M';
var s = document.createElement('script');
s.async = true;
s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaMeasurementId;
document.head.appendChild(s);

var s2 = document.createElement('script');
s2.innerHTML = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${gaMeasurementId}');
`;
document.head.appendChild(s2);
