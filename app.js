const fs = require('fs');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const cheerio = require('cheerio');
const docx = require('docx');
const docxConverter = require('docx-pdf');
const appConstants = require("./constants");
var Save = require("./src/save_disk");

const {
  Document,
  Paragraph,
  Packer
} = docx;

//Might need to change user agent. Book url is the starting address of the text you want to scrape
const uA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36';
var bookURL='https://www.wattpad.com/202997920-human-error-book-1-one-the-sick-day';
var options = {
  url: bookURL,
  headers: {
    'Referer': bookURL,
    'User-Agent': uA
  }
};

var doc = new docx.Document();
var packer = new docx.Packer();
var empty = new docx.Paragraph(`\n`);

function traverseSite(options) {
  rp(options) // request promise
    .then(function(html) {
      const { story_title, item_title, author_name, chapter_title, junk, paragraph_body, next_chapter_link } = appConstants;
      $ = cheerio.load(html);
       // Author Information
      var FILE = new Save(story_title);
      doc.addParagraph(new docx.Paragraph($(item_title).text()).thematicBreak());
      doc.addParagraph(empty);
      doc.addParagraph(new docx.Paragraph($(author_name).text()).pageBreak());
       //Chapter Title
      doc.addParagraph(new docx.Paragraph($(chapter_title).text()).heading2().center());
      doc.addParagraph(empty);
       //remove junk
      $(junk).remove();
       //Paragraph text to docx
      $(paragraph_body).each(function() {
      var paragraph = new docx.Paragraph(`\n\n${$(this).text().replace('  ','')}n\n`);
        doc.addParagraph(paragraph);
        doc.addParagraph(empty);
      });
      packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(`${$(story_title).text()}.docx`, buffer);
      });
      console.log(`[PROCESSING] ${$('.next-part-link', html).attr("href")}`);
      if (!$(next_chapter_link, html).attr("href")) {
        FILE.convert().then(() => {
          console.log("Done")
        })
        /**
        fs.readFile(`${$(story_title).text()}.docx`, (err, data) => {
          docxConverter(`${$(story_title).text()}.docx`, `${$(story_title).text()}.pdf`, function(err, result) {
            if (err) {
              console.error(err);
            }
            console.log('Writing results to disk');
          });
        });
        fs.unlink(`${$(story_title).text()}.docx`, (err) => {
          if (err) throw err;
          console.log('path/file.txt was deleted');
        }); **/
        return;
      }

      return traverseSite({
        url: $(next_chapter_link, html).attr("href"),
        headers: {
          'Referer': $(next_chapter_link, html).attr("href"),
          'User-Agent': uA
        },
      });
     })
    .catch(e => {
      if(e.name == "RequestError") console.error("Cannot reach Wattpad at the moment. Please try again later.");
    });
}

traverseSite(options.url);
