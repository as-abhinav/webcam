$(function(){
  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia({ video: true, audio: true }, onSuccess, onError);

  function onError(err) {
      console.log("The following error occured: " + err);
  }

  function onSuccess(localMediaStream) {
    var video = $('#video').get(0);
    video.autoplay = true;
    var url = navigator.mozGetUserMedia ? window.URL : window.webkitURL;
    video.src = url.createObjectURL(localMediaStream);
  }

  function getImage(){
      var v = $('#video').get(0);
      var canvas = $('#canvas').get(0);
      var context = canvas.getContext('2d');

      var cw = Math.floor(canvas.clientWidth);
      var ch = Math.floor(canvas.clientHeight);
      canvas.width = cw;
      canvas.height = ch;

      context.drawImage(v,0,0,cw,ch);
  }

  function processImage(){
    var filterType = $(this).data('filter-type');
    var canvas = $('#canvas').get(0);
    var context = canvas.getContext('2d');
    var imageData=context.getImageData(0,0, canvas.width, canvas.height);
    
    context.putImageData(applyFilter(filterType, imageData),0,0);
  }

  function applyFilter(filterType, imageData){
    switch(filterType){
      case "bnw":
        return grayscale(imageData);
      case "brightness": 
        return brightness(imageData, 10);
      case "darkness":
        return brightness(imageData, -10);
      case "sepia":
        return sepia(imageData);
      case "threshold":
        return threshold(imageData, 128, 100, 10);
      case "invert":
        return invert(imageData);
    }
  }

  function grayscale(pixels, args) {
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      d[i] = d[i+1] = d[i+2] = (0.2126*r + 0.7152*g + 0.0722*b);
    }
    return pixels;
  }

  function brightness(pixels, adjustment) {
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
      d[i] += adjustment;
      d[i+1] += adjustment;
      d[i+2] += adjustment;
    }
    return pixels;
  }

  function sepia(pixels) {
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i + 1];
      var b = d[i + 2];
      d[i]     = (r * 0.393)+(g * 0.769)+(b * 0.189); // red
      d[i + 1] = (r * 0.349)+(g * 0.686)+(b * 0.168); // green
      d[i + 2] = (r * 0.272)+(g * 0.534)+(b * 0.131); // blue
    }
    return pixels;
  }

  function threshold(pixels, threshold, high, low) {
    if (high == null) high = 255;
    if (low == null) low = 0;
    var d = pixels.data;
    var dst = pixels.data;
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      var v = (0.3*r + 0.59*g + 0.11*b >= threshold) ? high : low;
      dst[i] = dst[i+1] = dst[i+2] = v;
      dst[i+3] = d[i+3];
    }
    return pixels;
  }

  function invert(pixels) {
    var d = pixels.data;
    var dst = pixels.data;
    for (var i=0; i<d.length; i+=4) {
      dst[i] = 255-d[i];
      dst[i+1] = 255-d[i+1];
      dst[i+2] = 255-d[i+2];
      dst[i+3] = d[i+3];
    }
    return pixels;
  }

  $("#btnClick").on("click", getImage);
  $("#filterBtns button").on("click", processImage);
  $("#save").on("click", function(){
    Canvas2Image.saveAsPNG($('#canvas').get(0));
  });
});