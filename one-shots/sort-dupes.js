const path = require('path')
const glob = require('glob')
const fse = require('fs-extra')

// a hash map that will bind file IDs with file paths
let filesMap = {}

// given a file path, will extract an unique id (perfect hash)
function hash (filePath) {
  // right now use the file name
  return path.basename(filePath)
}

// get dir index
let cwd = '/Users/allan/Downloads/dumps-sma300fu'
let dirs = glob.sync('sdcard_*', { cwd })
dirs.sort()

console.log('Collecting hashes:')
dirs.forEach((dir, index, list) => {
  let filePaths = glob.sync(path.join(cwd, dir, '*'))
  console.log(`\t${index + 1}/${list.length} - ${dir} (${filePaths.length} files)`)
  filePaths.forEach(filePath => {
    let fileHash = hash(filePath)
    if (fileHash in filesMap) { return }
    filesMap[fileHash] = filePath
  })
})

console.log(`Collected ${Object.keys(filesMap).length} hashes...`)

let outDir = '/Users/allan/Downloads/work-dir/out'
let uniques = Object.keys(filesMap).map(key => filesMap[key])
console.log('Copying files:')
uniques.forEach((source, index, list) => {
  let fileName = path.basename(source)
  console.log(`\t${index + 1}/${list.length} - ${fileName}...`)
  fse.copySync(source, path.join(outDir, fileName))
})

console.log('DONE!')
