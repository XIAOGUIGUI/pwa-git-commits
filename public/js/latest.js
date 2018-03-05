(function() {
  'use strict';
  function dateFtt(fmt,date)  {  
    var o = {   
      "M+" : date.getMonth()+1,                 //月份   
      "d+" : date.getDate(),                    //日   
      "h+" : date.getHours(),                   //小时   
      "m+" : date.getMinutes(),                 //分   
      "s+" : date.getSeconds(),                 //秒   
      "q+" : Math.floor((date.getMonth()+3)/3), //季度   
      "S"  : date.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
      fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
      if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
  } 
  var app = {
    spinner: document.querySelector('.loader')
  };

  var container = document.querySelector('.container');

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Get fresh, updated data from Github whenever you are clicked
    toast('Fetching latest data...');
    fetchCommits();
    console.log("Getting fresh data!!!");
  });

  var commitContainer = ['.first', '.second', '.third', '.fourth', '.fifth'];
  var posData = ['first', 'second', 'third', 'fourth', 'fifth'];

  // Check that localStorage is both supported and available
  function storageAvailable(type) {
    try {
      var storage = window[type],
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      return false;
    }
  }

  // Get Commit Data from Github API
  function fetchCommits() {
    var url = 'https://api.github.com/repos/XIAOGUIGUI/pwa-git-commits/commits';

    app.spinner.setAttribute('visible', true); 

    fetch(url)
    .then(function(fetchResponse){ 
      return fetchResponse.json();
    })
    .then(function(response) {
        console.log("Response from Github", response);

        var commitData = {};

        for (var i = 0; i < posData.length; i++) {
          if (response[i]) {
            commitData[posData[i]] = {
              message: response[i].commit.message,
              author: response[i].commit.author.name,
              time: response[i].commit.author.date,
              link: response[i].html_url
            };
          }
        }

        localStorage.setItem('commitData', JSON.stringify(commitData));

        for (var i = 0; i < commitContainer.length; i++) {
          if (response[i]) {
            var commitDate = dateFtt('yyyy-MM-dd hh:mm:ss',new Date(response[i].commit.author.date))
            container.querySelector("" + commitContainer[i]).innerHTML = 
            "<h4> 信息: " + response[i].commit.message + "</h4>" +
            "<h4> 作者: " + response[i].commit.author.name + "</h4>" +
            "<h4> 时间: " + commitDate +  "</h4>" +
            "<h4>" + "<a href='" + response[i].html_url + "'>查看更多</a>"  + "</h4>";
          }
        }

        app.spinner.setAttribute('hidden', true); // hide spinner
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  // Get the commits Data from the Web Storage
  function fetchCommitsFromLocalStorage(data) {
    var localData = JSON.parse(data);

    app.spinner.setAttribute('hidden', true); //hide spinner

    for (var i = 0; i < commitContainer.length; i++) {
      if (localData[posData[i]]){
        var commitDate = dateFtt('yyyy-MM-dd hh:mm:ss',new Date(localData[posData[i]].time))
        container.querySelector("" + commitContainer[i]).innerHTML = 
          "<h4> 信息: " + localData[posData[i]].message + "</h4>" +
          "<h4> 作者: " + localData[posData[i]].author + "</h4>" +
          "<h4> 时间: " + commitDate +  "</h4>" +
          "<h4>" + "<a href='" + localData[posData[i]].link + "'>查看更多</a>"  + "</h4>";
      }
    }
  };

  if (storageAvailable('localStorage')) {
    if (localStorage.getItem('commitData') === null) {
      /* The user is using the app for the first time, or the user has not
       * saved any commit data, so show the user some fake data.
       */
      fetchCommits();
      console.log("Fetch from API");
    } else {
      fetchCommitsFromLocalStorage(localStorage.getItem('commitData'));
      console.log("Fetch from Local Storage");
    }   
  }
  else {
    toast("We can't cache your app data yet..");
  }
})();