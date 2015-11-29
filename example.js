var pen = require('penumbra')();

pen.task('greeting', function * (){
    console.log('Hello world!');
});

pen.exec('greeting');
