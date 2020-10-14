const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const http = require("http");
const https = require("https");

const url = "https://robohash.org";
const extension = ".jpeg";

const schema = {
  Name: {
    prop: "Name",
    type: String,
  },
};

readXlsxFile("excel_file.xlsx", { schema }).then(({ rows, errors }) => {
  rows.forEach((row) => {
    // console.log(url + "/" + row["Name"]);
    // console.log(__dirname+"/downloads")
    download(
      url + "/" + row["Name"],
      __dirname + "/downloads/" + row["Name"] + extension
    );
  });
});

function download(url, filePath) {
  const proto = !url.charAt(4).localeCompare("s") ? https : http;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    let fileInfo = null;

    const request = proto.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      fileInfo = {
        mime: response.headers["content-type"],
      };
      console.log(fileInfo);

      response.pipe(file);
    });

    file.on("finish", () => resolve(fileInfo));

    request.on("error", (err) => {
      fs.unlink(filePath, () => reject(err));
    });

    file.on("error", (err) => {
      fs.unlink(filePath, () => reject(err));
    });

    request.end();
  });
}
