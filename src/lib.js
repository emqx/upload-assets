const core = require('@actions/core');
const github = require('@actions/github');

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const GetRelease = require('./get-release')
const glob = require('glob')

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    let tagName = core.getInput('tag_name', { required: false });
    let skipExisting = core.getInput('skip_existing', { required: false });
    if (tagName.length == 0) {
      tagName = github.context.ref
    }
    const { owner, repo } = github.context.repo;
    const getRelease = new GetRelease(octokit, owner, repo, tagName)

    const release = await getRelease.fetch();
    const uploadUrl = release.upload_url;
    const existingAssetNames = release.assets.map(asset => asset.name);

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const assetPathsSt = core.getInput('asset_paths', { required: true });

    const assetPaths = JSON.parse(assetPathsSt)
    if(!assetPaths || assetPaths.length == 0) {
      core.setFailed("asset_paths must contain a JSON array of quoted paths");
      return
    }

    let paths = []
    for(let i = 0; i < assetPaths.length; i++) {
      let assetPath = assetPaths[i];
      if(assetPath.indexOf("*") > -1) {
        const files = glob.sync(assetPath,{ nodir: true })
        for (const file of files) {
            paths.push(file)
        }
      }else {
        paths.push(assetPath)
      }
    }

    core.debug(`Expanded paths: ${paths}`)

    downloadURLs = []
    for(let i = 0; i < paths.length; i++) {
      let asset = paths[i];
      const assetName = path.basename(asset);

      // Skip upload if asset already exists
      if (skipExisting && existingAssetNames.includes(assetName)) {
        console.log(`Asset with the name ${assetName} already exists. Skipping upload for this asset.`);
        continue;
      }

      // Determine content-length for header to upload asset
      const contentLength = filePath => fs.statSync(filePath).size;
      const contentType = "binary/octet-stream"
      // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
      const headers = { 
        'content-type': contentType, 
        'content-length': contentLength(asset)
      };
  
      console.log(`Uploading ${assetName}`)

      // Upload a release asset
      // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
      const uploadAssetResponse = await octokit.repos.uploadReleaseAsset({
        url: uploadUrl,
        headers,
        name: assetName,
        data: fs.readFileSync(asset)
      });

      // Get the browser_download_url for the uploaded release asset from the response
      const {
        data: { browser_download_url: browserDownloadUrl }
      } = uploadAssetResponse;

      // Set the output variable for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
      downloadURLs.push(browserDownloadUrl);
    }

    core.setOutput('browser_download_urls', JSON.stringify(downloadURLs));
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
