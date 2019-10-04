import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="parsr-client",
    version="0.0.1",
    author="AXA Group Operations S.A.",
    description="Python client for Parsr",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="http://par.sr",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: Apache-2.0 License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)