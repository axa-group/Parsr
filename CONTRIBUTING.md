# Contributing

If you're looking to contribute to the project you're in the right place!

Here's a quick guide to create a pull request:

1.  Fork the github project by visiting this URL: https://github.com/axa-group/Parsr/fork

2.  Clone the git repository

        $ git clone git@github.com:YOUR-GITHUB-USERNAME/Parsr.git

3.  Create a new branch in your git repository (branched from `develop` - see [Notes about branching](#branching) below).

        $ cd Parsr/
        $ git checkout develop
        $ git checkout -b issue/123-solve-the-issue # pick a better title

4.  Setup your build environment (see [build instructions in our README][readme]) and start hacking the project. You must follow our code style guidelines (we use `prettier`, checkout our [README][readme]), write good commit messages, comment your code and write automated tests.

5.  When your patch is ready, [submit a pull request][pr]. Add some comments or screen shots to help us.

6.  Wait for us to review your pull request. If something is wrong or if we want you to make some changes before the merge, we'll let you know through commit comments or pull request comments.

[readme]: https://github.com/axa-group/Parsr/blob/develop/README.md
[pr]: https://github.com/axa-group/Parsr/compare/

# Versioning

We're using [semantic versioning](https://semver.org/).

Given a version number `MAJOR.MINOR.PATCH`, increment the:

- **MAJOR** version when you make incompatible API changes,
- **MINOR** version when you add functionality in a backwards-compatible manner, and
- **PATCH** version when you make backwards-compatible bug fixes.

# Branching

We use the [git flow branching model][git-flow].

- `master` branch represents latest release version. HEAD of this branch should be equal to last tagged release.

- `develop` branch represents the cutting edge version. This is probably the one you want to fork from and base your patch on. This is the default github branch.

- Version tags. All released versions are tagged and pushed in the repository. For instance if you want to checkout the 1.0.2 version:

        $ git checkout 1.0.2

- Release branches. When a new version is going to be released, we'll branch from `develop` to `release/x.y`. This marks version x.y code freeze. Only blocking or major bug fixes will be merged to these branches. They represent beta and release candidates.

- Hotfix branches. When one or several critical issues are found on current released version, we'll branch from `tags/x.y` to `hotfix/x.y.1` (or from `tags/x.y.z` to `hotfix/x.y.z+1` if a hotfix release has already been published).

- Fix or feature branches. Proposed new features and bug fixes should live in their own branch. Use the following naming convention: if a github issue exists for this feature/bugfix, the branch will be named `issue/ISSUEID-comment` where ISSUEID is the corresponding github issue id. If a github issue doesn't exist, branch will be named `feature/comment`. These branches will be merged in:
  - `hotfix/x.y.z` if the change is a fix for a released version
  - `release/x.y` if the change is a fix for a beta or release candidate
  - `develop` for all other cases

Note: `release/x.y` or `hotfix/x.y.z` will be merged back in `master` after a new version is released. A new tag will be created and pushed at the same time.

[git-flow]: http://nvie.com/posts/a-successful-git-branching-model/
