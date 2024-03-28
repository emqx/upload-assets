class GetRelease {
    constructor(octokit, owner, repo, tagName) {
        this.octokit = octokit;
        this.owner = owner;
        this.repo = repo;
        this.tagName = tagName;
    }

    async fetch() {
        const tag = this.tagName.replace("refs/tags/", "");
        const getReleaseResponse = await this.octokit.repos.getReleaseByTag({
            owner: this.owner,
            repo: this.repo,
            tag
        });

        const release = getReleaseResponse.data;
        return release;
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
