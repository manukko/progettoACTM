/**
Inverse Discrete Fourier transform (IDFT).
(the slowest possible implementation)
Assumes `inpReal` and `inpImag` arrays have the same size.
*/
function iDFT(inpReal, inpImag) {
    var N,
        k,
        n,
        angle,
        outReal = [],
        outImag = [],
        sumReal,
        sumImag,
        kk,
        sin = [],
        cos = [],
        twoPiByN;

    N = inpReal.length;
    twoPiByN = Math.PI / N * 2;
    /* initialize Sin / Cos tables */
    for (n = 0; n < N; n++) {
        angle = twoPiByN * n;
        sin.push(Math.sin(angle));
        cos.push(Math.cos(angle));
    }

    for (n = 0; n < N; n++) {
        sumReal = 0;
        sumImag = 0;
        kk = 0;
        for (k = 0; k < N; k++) {
            sumReal +=  inpReal[k] * cos[kk] - inpImag[k] * sin[kk];
            sumImag +=  inpReal[k] * sin[kk] + inpImag[k] * cos[kk];
            kk = (kk + n) % N;
        }
        outReal.push(sumReal / N);
        outImag.push(sumImag / N);
    }
    return [outReal, outImag];
};


/**
Discrete Fourier transform (DFT).
(the slowest possible implementation)
Assumes `inpReal` and `inpImag` arrays have the same size.
*/
function DFT(inpReal) {
    var N,
        k,
        n,
        angle,
        outReal = [],
        outImag = [],
        sumReal,
        sumImag,
        nn,
        sin = [],
        cos = [],
        twoPiByN;

    N = inpReal.length;
    twoPiByN = Math.PI / N * 2;

    /* initialize Sin / Cos tables */
    for (k = 0; k < N; k++) {
        angle = twoPiByN * k;
        sin.push(Math.sin(angle));
        cos.push(Math.cos(angle));
    }

    for (k = 0; k < N; k++) {
        sumReal = 0;
        sumImag = 0;
        nn = 0;
        for (n = 0; n < N; n++) {
            sumReal +=  inpReal[n] * cos[nn] 
            sumImag += -inpReal[n] * sin[nn] 
            nn = (nn + k) % N;
        }
        outReal.push(sumReal);
        outImag.push(sumImag);
    }
    return [outReal, outImag];
};


//------------------------------------------------------------------------------------------------------------


var canvas = document.querySelector("#canvas");

var ctx = canvas.getContext("2d")

var c = new AudioContext();

var scriptNode = c.createScriptProcessor(2048, 1, 1);

scriptNode.onaudioprocess = function(audioProcessingEvent) {
  
  // The input buffer is the song we loaded earlier
  var inputBuffer = audioProcessingEvent.inputBuffer;

  // The output buffer contains the samples that will be modified and played
  var outputBuffer = audioProcessingEvent.outputBuffer;
  
  var resultDFT = [];
  var modReal = []
  var modImm = [];
  var resultiDFT = [];

  // Loop through the output channels (in this case there is only one)
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);
        
    // Loop through the 1024 samples
    for (var sample = 0; sample < inputBuffer.length; sample++) {
      // make output equal to the same as the input          
      
      if(sample == inputBuffer.length-1){
        
        resultDFT = DFT(inputData); //Problemi sintassi o robe   
        
        for(var i = 0; i < inputBuffer.length-100; i++){
            resultDFT[0][i] = resultDFT[0][i+100];
            resultDFT[1][i] = resultDFT[1][i+100];

        } 
        
        modReal = resultDFT[0];
        modImm = resultDFT[1];
        
        
        
        resultiDFT = iDFT(modReal,modImm);
        
        for(var i = 50; i < inputBuffer.length/2; i++){
          outputData[i] = resultiDFT[0][i*2];
        } 
        
      }       
      // dft(input) -> modifhci imput -> idft(segnale modificato)           
      // add noise to each output sample
      //outputData[sample] += ((Math.random() * 2) - 1) * 0.2;   
    }
  }  
}


//------------------------------------------------------------------------------------------------------------



var analyser = c.createAnalyser();
navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
    source = c.createMediaStreamSource(stream);
    source.connect(scriptNode);
    scriptNode.connect(analyser);
    //delay.connect(analyser);
})

analyser.fftSize = 1024;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.connect(c.destination);

function drawSamples()
{
  // analyser.getByteFrequencyData(dataArray);
  analyser.getByteTimeDomainData(dataArray);
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.beginPath();
  for(var i=0; i<canvas.width;i++) {
    ctx.lineTo(i,canvas.height - dataArray[i]);
  }
  ctx.stroke();
  requestAnimationFrame(drawSamples);
}

drawSamples();