var Canvas = require("canvas"),
  fs = require("fs"),
  jsdom = require("jsdom"),
  document = jsdom.jsdom(),
  d3 = require("d3"),
  cloud = require("d3-cloud"),
  svg2png = require("svg2png"),
  mongojs = require('mongojs'),
  db = mongojs('resumebot', ['texts']);

db.texts = db.collection('texts');

module.exports = function Cloud(pOpts) {
  if (pOpts) {
    opts = pOpts;
  } else {
    opts = {};
  }

  var ignoredWords = opts.ignoredWords || ['o', 'no', 'si', 'sin', 'se', 'son', 'hay', 'al', 'te', 'que', 'es', 'por', 'para', 'las', 'los', 'de', 'en', 'le', 'la', 'lo', 'del', 'con', 'ese', 'esa', 'el', 'una', 'un', 'zak', 'facu', 'facundo', 'mendez', 'zack', 'mendes', 'fac', 'faku', 'unos', 'uno', 'a', 'que', 'me', 'y', '?'],
    bannedStart = opts.bannedStart || ['/', 'http', '@'],
    bannedEnd = opts.bannedEnd || ['?'],
    width = opts.width || 1024,
    height = opts.height || 800,
    type = opts.type || '90',
    minFontSize = opts.minFontSize || 20,
    maxFontSize = opts.maxFontSize || 130,
    requireMinWords = opts.requireMinWords || 40,
    backgroundColor = opts.backgroundColor || 'white',
    font = opts.font || 'Impact',
    savePath = opts.savePath || './clouds';

  try {
    fs.statSync(savePath);
  } catch (e) {
    fs.mkdirSync(savePath);
  }

  return {
    getCloud: function(chatId, lapsus, cb) {
      var _this = this,
        mayorA;

      switch (lapsus) {
        case "day":
          mayorA = 60 * 60 * 24;
          break;
        case "week":
          mayorA = 60 * 60 * 24 * 7;
          break;
        case "month":
          mayorA = 60 * 60 * 24 * 30;
          break;
        case "year":
          mayorA = 60 * 60 * 24 * 365;
          break;
        case "life":
          mayorA = null;
          break;
        default:
          mayorA = 60 * 60 * 24 * 2; //48hs
          break;
      }

      var filter = {
        chatId: chatId
      };
      if (mayorA) {
        mayorA = parseInt((new Date().getTime() / 1000)) - mayorA;
        filter.date = {
          $gte: mayorA
        };
      }

      db.texts.find(filter).toArray(function(e, data) {
        var words = [];
        for (var i = 0; i < data.length; i++) {
          var rawWords = data[i].words.split(" ").map(_this.parseWords).filter(function(v) {
            return v;
          });

          for (var j = 0; j < rawWords.length; j++) {
            if (_this.isInside(rawWords[j], words)) {
              words = _this.sumSize(rawWords[j], words);
            } else {
              if (ignoredWords.indexOf(rawWords[j]) == -1) {
                words.push({
                  text: rawWords[j],
                  size: 1
                });
              }
            }
          }
        }

        words = _this.reMap(words);
        if (words.length < requireMinWords) {
          return cb("NO_DATA", null);
        }

        words = _this.sort(words);
        words = words.slice(0, 300);

        _this.genCloud(words, function(words) {
          return _this.draw(words, chatId, cb);
        });
      });
    },

    sort: function(words) {
      function compare(a, b) {
        if (a.size < b.size)
          return 1;

        if (a.size > b.size)
          return -1;

        return 0;
      }

      return words.sort(compare);
    },

    genCloud: function(words, cb) {
      var _this = this;

      cloud().size([width, height])
        .canvas(function() {
          return new Canvas(1, 1);
        })
        .words(words)
        .padding(5)
        .rotate(function() {
          return _this.angulo()
        })
        .font(font)
        .fontSize(function(d) {
          return d.size;
        })
        .on("end", cb)
        .start();

    },

    draw: function(words, id, cb) {
      var fill = d3.scale.category20();

      var svgInit = d3.select(document.body).html("").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

      if (backgroundColor) {
        svgInit.append("rect")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("fill", backgroundColor);
      }

      svgInit.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) {
          return d.size + "px";
        })
        .style("font-family", font)
        .style("fill", function(d, i) {
          return fill(i);
        })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) {
          return d.text;
        });

      var svg = d3.select(document.body).node().innerHTML;

      var unaDate = new Date().getTime();
      var destino = savePath + "/chat" + id + "-" + unaDate;

      fs.writeFileSync(destino + ".svg", "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + svg);

      svg2png(destino + ".svg", destino + ".png", function(err) {
        cb(err, destino + ".png");
      });

    },

    getCaption: function(part) {
      switch (part) {
        case 'day':
          return "Daily summary";

        case 'week':
          return "Weekly summary";

        case 'month':
          return "Monthly summary";

        case 'year':
          return "Annual summary";

        case 'life':
          return "General summary";

        default:
          return "Latest 48hs summary";
      }

    },

    angulo: function() {
      if (type == "90") {
        return ~~(Math.random() * 2) * 90;
      } else {
        return (~~(Math.random() * 6) - 3) * 30;
      }
    },

    parseWords: function(item) {
      var word = item.toLowerCase().replace(/,/g, '').replace(/\"/g, '').replace(/\./g, '');

      for (var i = 0; i < bannedStart.length; i++) {
        if (word.indexOf(bannedStart[i]) === 0) {
          return "";
        }
      }

      for (var j = 0; j < bannedEnd.length; j++) {
        if (word.indexOf(bannedEnd[j]) == word.length - 1) {
          return "";
        }
      }

      return word.trim();
    },

    map: function(x, in_min, in_max, out_min, out_max) {
      return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },

    reMap: function(words) {
      var max = 1;
      for (var i = 0; i < words.length; i++) {
        if (words[i].size > max) {
          max = words[i].size;
        }
      }

      for (var k = 0; k < words.length; k++) {
        words[k].size = parseInt(this.map(words[k].size, 1, max + 1, minFontSize, maxFontSize));
      }

      return words;

    },

    isInside: function(needle, haystack) {
      for (var i = 0; i < haystack.length; i++) {
        if (haystack[i].text == needle) {
          return true;
        }
      }

      return false;
    },

    sumSize: function(word, words) {
      for (var i = 0; i < words.length; i++) {
        if (words[i].text == word) {
          words[i].size = words[i].size + 1;
        }
      }

      return words;
    },

    save: function(toSave) {
      db.texts.insert(toSave, function(err, res) {
        console.log(err);
        console.log(res);
      });
    }
  };

};