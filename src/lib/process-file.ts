type extension="pdf" | "txt" | "jpg" | "jpeg" | "png" | "unknown" 
function getFileExtension(fileName: string):extension {
  const splittedArray = fileName.split(".");
  const extension = splittedArray[splittedArray.length - 1];
  switch (extension) {
    case "pdf":
      return "pdf";
    case "txt":
      return "txt";
    case "jpg":
        return "jpg"
    case "jpeg":
        return "jpeg"
    case "png":
        return "png"
    default:
      return "unknown";
  }
}

async function processFile(file:File){
    const extension=getFileExtension(file.name)
}
