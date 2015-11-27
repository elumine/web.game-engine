window.onload = function() {
    var output = document.getElementById('output').getContext('2d'), 
    	video = document.getElementById('video'), 
    	system = new CRenderSystem();

    document.getElementById('output').addEventListener('click', function() {
        if (video.playing) {
        	video.pause(); 
        	video.playing = false
        } else {
        	video.play(); 
        	video.playing = true
        }
    });
    

    system.pixelShaders.push(new CPixelShader([0, 0, 213, 360], function(r, g, b, a) {     //GrayScale Mode
        var avg = 0.3  * r + 0.59 * g + 0.11 * b;
        return [avg, avg, avg, 255];
    }));

    system.pixelShaders.push(new CPixelShader([213, 0, 213, 360], function(r, g, b, a) {   //Negative Mode
        return [255-r,255-g,255-b,a];
    }));

    var interval = setInterval(function() {
        system.draw(output);
    }, 17);

    video.play();
}


function CRenderSystem() {
    this.pixelShaders = [];
    this.draw = function(ctx) {
        ctx.drawImage(video, 0, 0);
        for (var i = 0; i < this.pixelShaders.length; i++)  {
            this.pixelShaders[i].draw(ctx);
        }
    }
}


function CPixelShader(area, shade) {
    this.area = area;
    this.draw = function(ctx) {
        oldImage = ctx.getImageData(this.area[0], this.area[1], this.area[2], this.area[3]);
        newImage = ctx.createImageData(this.area[2], this.area[3]);

        for (var i = 0; i < oldImage.data.length; i+=4) {
            result = shade(oldImage.data[i], oldImage.data[i+1], oldImage.data[i+2], oldImage.data[i+3]);
            newImage.data[i] = result[0]
            newImage.data[i+1] = result[1]
            newImage.data[i+2] = result[2]
            newImage.data[i+3] = result[3]
        }

        ctx.putImageData(newImage, this.area[0], this.area[1]);
    }
}