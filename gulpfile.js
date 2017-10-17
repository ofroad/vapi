// 获取 gulp
var gulp = require('gulp')

// 获取 uglify 模块（用于压缩 JS）
var uglify = require('gulp-uglify')

//获取 strip-debug 模块去掉调试信息
var stripDebug = require('gulp-strip-debug');

// 压缩 js 文件
// 在命令行使用 gulp script 启动此任务
gulp.task('script', function() {
    // 1. 找到文件
    gulp.src('src/*.js')
		.pipe(stripDebug())
        .pipe(uglify())
	
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('dist/src/'))
})

// 在命令行使用 gulp auto 启动此任务
gulp.task('auto', function () {
    // 监听文件修改，当文件被修改则执行 script 任务
    gulp.watch('*.js', ['script'])
})


// 使用 gulp.task('default') 定义默认任务
// 在命令行使用 gulp 启动 script 任务和 auto 任务
gulp.task('default', ['script', 'auto'])