#!/usr/bin/env node
var fs = require('fs');
var answerQuestionMapper = require('answer-question-mapper'),
    argv = require('optimist').argv;

var cmd = argv._[0];
if (cmd === 'help' || argv.h || argv.help) {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    return;
}

var readline = require('readline'),
    Iterator = require('js-array-iterator');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var path = fs.existsSync(String(process.cwd() + '/' + cmd.toString())) ? String(process.cwd() + '/' + cmd.toString()) : String(cmd.toString());
if (!fs.existsSync(path)) {
  console.error('Conf-JSON file not found!');
  process.exit(0);
}

var questions = require(path);

var testIterator = new Iterator(Object.keys(questions));
var answers = {};
testIterator.on('next', function (question) {
  rl.question(question, function(answer) {
    if (answer === '')
      answers[question] = questions[question].default;
    else {
      if (answer === true || answer === 1 || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
        answers[question] = true;
      else
        answers[question] = false;
    }
    testIterator.next();
  });
}).on('end', function () {
  var combined = answerQuestionMapper(require(process.cwd() + '/package.json'), questions, answers);
  fs.writeFileSync('./package.json', combined.toJSON(), 'utf8');
  rl.close();
});

testIterator.next();