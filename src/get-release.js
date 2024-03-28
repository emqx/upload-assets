class GetRelease {
    constructor(octokit, owner, repo, tagName) {
        this.octokit = octokit;
        this.owner = owner;
        this.repo = repo;
        this.tagName = tagName;
    }

    async getURL() {
        // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
        const tag = this.tagName.replace("refs/tags/", "");

        // Get a release from the tag name
        // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
        // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
        const getReleaseResponse = await this.octokit.repos.getReleaseByTag({
            owner: this.owner,
            repo: this.repo,
            tag
        });

        const uploadURL = getReleaseResponse.data.upload_url
        return uploadURL;
    }

    async getId() {
      // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
      const tag = this.tagName.replace("refs/tags/", "");

      // Get a release from the tag name
      // API Documentation: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-a-release-by-tag-name
      // Octokit Documentation: https://octokit.github.io/rest.js/#repos-get-release-by-tag
      const getReleaseResponse = await this.octokit.repos.getReleaseByTag({
          owner: this.owner,
          repo: this.repo,
          tag
      });

      const releaseId = getReleaseResponse.data.id
      return releaseId;
    }
}

module.exports = GetRelease

// const github = require('@actions/github');

// async function runMe() {

//     // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
//     const octokit = github.getOctokit("");
//     const getRelease = new GetRelease(octokit, {
//         ref: "refs/tags/0.1.19",
//         repo: {
//           repo: "release-it",
//           owner:"alexellis",
//         }
//     })
//     const uploadUrl = await getRelease.getURL()
//     console.log(uploadUrl)
//   }

//   runMe()
