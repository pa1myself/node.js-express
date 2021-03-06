const express = require('express');
const router = express.Router();


let Article = require('../models/article');

let User = require('../models/user');

    // let articles = [
    //     {
    //         id:1,
    //         title:'Article one',
    //         author:'Pavan',
    //         body:'This is article one'
    //     },
    //     {
    //         id:2,
    //         title:'Article two',
    //         author:'Kumar',
    //         body:'This is article two'
    //     },
    //     {
    //         id:3,
    //         title:'Article three',
    //         author:'brad',
    //         body:'This is article three'
    //     },
    // ]



//add route
router.get('/add', ensureAuthenticated, function(req,res){
    res.render('add_article', {
        title:'Add Article'
    });
});

//add submit post route

router.post('/add', function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

    let errors = req.validationErrors();

    if(errors){
      res.render('add_article',{
        title:'Add Article',
        errors:errors
      });
    }else {
      let article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(function(err){
          if(err){
              console.log(err);
              return;
          } else {
            req.flash('success','Article Added');
             res.redirect('/');
          }
      });

    }
});

router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
        title:'Edit Article',
        article:article
    });
  });
});

router.post('/edit/:id', function(req,res){
     let article = {};
     article.title = req.body.title;
     article.author = req.body.author;
     article.body = req.body.body;

     let query = {_id:req.params.id}

     Article.update(query, article, function(err){
         if(err){
             console.log(err);
             return;
         } else {
           req.flash('success', 'Article Updated');
            res.redirect('/');
         }
     });
});

router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    }else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

//get single article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author,function(err, user){
      res.render('article', {
          article:article,
          author:user.name
      });
    });

  });
});

//access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}


module.exports = router;
