
exports.hello = 'hello from the foo module';

exports.format = function (template) {
  var re = /%[sdfo]/g, m, buf = '', prevIndex = 0, i = 1, v;
  while ((m = re.exec(template))) {
    if (m[0] === '%s') v = String(arguments[i++]);
    else if (m[0] === '%d') v = parseInt(arguments[i++]);
    else if (m[0] === '%f') v = parseFloat(arguments[i++]);
    else if (m[0] === '%o') v = JSON.stringify(arguments[i++]);
    buf += template.substring(prevIndex, m.index) + v;
    prevIndex = m.index + m[0].length;
  }
  buf += template.substring(prevIndex);
  return buf;
}
