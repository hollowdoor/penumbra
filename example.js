var pen = require('penumbra')();

pen.task('greeting', function(){
    alert('Hello world!');
});

pen.exec('greeting');
