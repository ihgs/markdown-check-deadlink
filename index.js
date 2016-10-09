'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var Deadlink = require('deadlink'),
    deadlink = Deadlink();
var Git = require('nodegit');
var recursive = require('recursive-readdir');
var marked = require('marked');

function links(markdown){
  let links = [];

  let renderer = new marked.Renderer();
  renderer.link = function(href, title, text){
    links.push(href);
    return marked.Renderer.prototype.link.apply(this, arguments);
  };

  renderer.image = function(href, title, text){
    links.push(href);
    return marked.Renderer.prototype.image.apply(this, arguments);
  };

  marked(markdown, { renderer: renderer });
  return links;
}

function isExistFile(file){
  try {
    fs.statSync(file);
    return true;
  } catch (err){
    if (err.code == 'ENOENT') return false;
    console.error(err);
    return false;
  }
}

function check(base, link){
  if (/^https?:\/\//.test(link)){
    console.log('%s %s %s', chalk.gray('-'), link, chalk.gray('http protocol is not supported now.'));
    return true;
  }else{
    let file = path.join(path.dirname(base), link)
    if (isExistFile(file)){
      console.log('%s %s', chalk.green('✓'), link);
      return true;
    }else {
      console.log('%s %s', chalk.red('✖'), link);
      return false;
    }
  }
}

Git.Repository.discover(".", 0, "")
  .then(function(foundpath){
    return Git.Repository.open(foundpath);
  })
  .then(function(repo){
    return repo.getHeadCommit();
  }).then(function(commit){
    return commit.getTree();
  }).then(function(tree){
    let walker = tree.walk();
    let has_error = false;
    walker.on("entry", function(entry){
      if (path.extname(entry.path()) === '.md'){
        let markdown = fs.readFileSync(entry.path(), 'utf-8');
        console.log('[%s]', entry.path())
        let link_list = links(markdown);
        for (let key in link_list){
          let ret = check(entry.path(), link_list[key]);
          if (!ret){
            has_error = true;
          }
        }
      }
    });
    walker.on("end", function(trees){
      if (has_error){
        console.log(chalk.red("Deadlink exists."))
        process.exit(1);
      } else{
        console.log(chalk.green("All OK."))
      }
    })
    walker.start();

  })
  .done();
