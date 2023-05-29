// MIT License
//
// Copyright (c) 2021-present K. S. Ernest (iFire) Lee & Open Metaverse Interoperability Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const {
  Extension,
  ExtensionProperty,
  PropertyType,
  WriterContext,
  ReaderContext,
} = require("@gltf-transform/core");

class VRMProperties extends ExtensionProperty {
  init() {}

  propertyType = "VRM";
  parentTypes = [PropertyType.NODE];
  extensionName = "VRM";
  extension;
}

class VRMC_materials_mtoonExtension extends Extension {
  extensionName = "VRMC_materials_mtoon";
  static EXTENSION_NAME = "VRMC_materials_mtoon";
  vrmData = null;
  vrmProperties;

  createVRM(name = "") {
    return new VRMProperties();
  }

  read(context) {
    const vrmExtensions = context.jsonDoc.json.extensions?.VRM;
    if (!vrmExtensions) {
      return this;
    }

    this.vrmData = vrmExtensions;
    return this;
  }

  write(context) {
    jsonRoot = context.jsonDoc.json;

    const currentVrmProperties = jsonRoot.getExtension(VRMC_materials_mtoonExtension.EXTENSION_NAME);
    if (!currentVrmProperties) {
      return this;
    }
    if (!this.vrmData) {
      return this;
    }
    jsonRoot.extensions = jsonRoot.json.extensions || {};
    jsonRoot.extensions[VRMC_materials_mtoonExtension.EXTENSION_NAME] = this.vrmData;
    return this;
  }
}

class VRMExtension extends Extension {
  extensionName = "VRM";
  static EXTENSION_NAME = "VRM";
  vrmData = null;
  vrmProperties;

  createVRM(name = "") {
    return new VRMProperties();
  }

  read(context) {
    const vrmExtensions = context.jsonDoc.json.extensions?.VRM;
    if (!vrmExtensions) {
      return this;
    }

    this.vrmData = vrmExtensions;
    return this;
  }

  write(context) {
    jsonRoot = context.jsonDoc.json;

    const currentVrmProperties = jsonRoot.getExtension(VRMExtension.EXTENSION_NAME);
    if (!currentVrmProperties) {
      return this;
    }
    if (!this.vrmData) {
      return this;
    }
    jsonRoot.extensions = jsonRoot.json.extensions || {};
    jsonRoot.extensions[VRMExtension.EXTENSION_NAME] = this.vrmData;
		return this;
  }
}

const { ALL_EXTENSIONS } = require("@gltf-transform/extensions");

module.exports = {
  extensions: [...ALL_EXTENSIONS, VRMExtension, VRMC_materials_mtoonExtension],
  onProgramReady: ({ program, io, Session }) => {
    program
      .command("vrm", "VRM process")
      .help("Import vrm")
      .argument("<input>", "Path to read glTF 2.0 (.glb, .gltf) model")
      .argument("<output>", "Path to write output")
      .action(({ args, options, logger }) =>
        Session.create(io, logger, args.input, args.output).transform(customTransform(options)));
  },
};

function customTransform(options) {
 return async (document) => {
 };
}