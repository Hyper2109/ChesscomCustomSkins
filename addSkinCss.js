if (document.contains(document.getElementById("skinCss"))) {
  document.getElementById("skinCss").href = skinUrl;
}
else{
  var head = document.getElementsByTagName('HEAD')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.id = 'skinCss';
  link.href = skinUrl;
  head.appendChild(link);
}
