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
  NodeIO,
} = require("@gltf-transform/core");
const { MeshoptSimplifier } = require("meshoptimizer");
const fs = require("fs");

const {
  resample,
  prune,
  dedup,
  textureCompress,
  textureResize,
  simplify,
} = require("@gltf-transform/functions");

const { KHRONOS_EXTENSIONS } = require("@gltf-transform/extensions");
class VRMProperties extends ExtensionProperty {
  init() {}

  constructor(graph, name) {
    super(graph, name);
    this.extension = new VRMC_node_constraintExtension(graph);
  }

  extensionName = "VRM";
  propertyType = "VRM";
  parentTypes = [PropertyType.NODE];
  extension;
}

class VRMExtension extends Extension {
  static EXTENSION_NAME = "VRM";
  extensionName = "VRM";
  vrmData = null;
  vrmProperties;

  constructor(graph) {
    super(graph);
    this.vrmProperties = [];
  }

  createVRM(name = "") {
    return new VRMProperties(this.document.getGraph(), name);
  }

  read(context) {
    const vrmExtensions = context.jsonDoc.json.extensions?.VRM || {};
    this.vrmData = vrmExtensions;
    return this;
  }

  write(context) {
    const jsonRoot = context.jsonDoc.json;
    jsonRoot.extensions = jsonRoot.extensions || {};
    if (this.vrmData) {
      jsonRoot.extensions[VRMExtension.EXTENSION_NAME] = this.vrmData;
    }
    return this;
  }
}

class VRMC_springBoneProperties extends ExtensionProperty {
  init() {}

  constructor(graph, name) {
    super(graph, name);
    this.extension = new VRMC_node_constraintExtension(graph);
  }

  extensionName = "VRMC_springBone";
  propertyType = this.extensionName;
  parentTypes = [PropertyType.NODE];
  extension;
}

class VRMC_springBoneExtension extends Extension {
  static EXTENSION_NAME = "VRMC_springBone";
  extensionName = "VRMC_springBone";
  vrm1Data = null;
  vrmProperties;

  constructor(graph) {
    super(graph);
    this.vrmProperties = [];
  }

  createVRMC_springBone(name = "") {
    return new VRMC_springBoneProperties(this.document.getGraph(), name);
  }

  read(context) {
    const vrm1Extensions =
      context.jsonDoc.json.extensions?.VRMC_springBone || {};
    this.vrm1Data = vrm1Extensions;
    return this;
  }

  write(context) {
    const jsonRoot = context.jsonDoc.json;
    jsonRoot.extensions = jsonRoot.extensions || {};
    if (this.vrm1Data) {
      jsonRoot.extensions[VRMC_springBoneExtension.EXTENSION_NAME] =
        this.vrm1Data;
    }
    return this;
  }
}

class VRMC_node_constraintProperties extends ExtensionProperty {
  init() {}
  constructor(graph, name) {
    super(graph, name);
    this.extension = new VRMC_node_constraintExtension(graph);
  }

  extensionName = "VRMC_node_constraint";
  propertyType = this.extensionName;
  parentTypes = [PropertyType.NODE];
  extension;
}

class VRMC_node_constraintExtension extends Extension {
  static EXTENSION_NAME = "VRMC_node_constraint";
  extensionName = "VRMC_node_constraint";
  vrm1Data = null;
  vrmProperties;

  constructor(graph) {
    super(graph);
    this.vrmProperties = [];
  }

  createVRMC_node_constraint(name = "") {
    return new VRMC_node_constraintProperties(this.document.getGraph(), name);
  }

  read(context) {
    const vrm1Extensions =
      context.jsonDoc.json.extensions?.VRMC_node_constraint || {};
    this.vrm1Data = vrm1Extensions;
    return this;
  }

  write(context) {
    const jsonRoot = context.jsonDoc.json;
    jsonRoot.extensions = jsonRoot.extensions || {};
    if (this.vrm1Data) {
      jsonRoot.extensions[VRMC_node_constraintExtension.EXTENSION_NAME] =
        this.vrm1Data;
    }
    return this;
  }
}

class VRMC_vrmProperties extends ExtensionProperty {
  init() {}

  extensionName = "VRMC_vrm";
  propertyType = this.extensionName;
  parentTypes = [PropertyType.NODE];
  extension;
}

class VRMC_vrmExtension extends Extension {
  static EXTENSION_NAME = "VRMC_vrm";
  extensionName = "VRMC_vrm";
  vrm1Data = null;
  vrmProperties;

  createVRMC_vrm(name = "") {
    return new VRMC_vrmProperties(this.document.getGraph(), name);
  }

  read(context) {
    const vrm1Extensions = context.jsonDoc.json.extensions?.VRMC_vrm || {};
    this.vrm1Data = vrm1Extensions;
    return this;
  }

  write(context) {
    const jsonRoot = context.jsonDoc.json;
    jsonRoot.extensions = jsonRoot.extensions || {};
    if (this.vrm1Data) {
      jsonRoot.extensions[VRMC_vrmExtension.EXTENSION_NAME] = this.vrm1Data;
    }
    return this;
  }
}

class VRMC_materials_mtoonExtension extends VRMExtension {
  extensionName = "VRMC_materials_mtoon";
  static EXTENSION_NAME = "VRMC_materials_mtoon";
}

class OMI_personalityExtension extends Extension {
  extensionName = "OMI_personality";
  static EXTENSION_NAME = "OMI_personality";
  personalityData = {};
  init(options) {
    this.personalityData["agent"] = options["agent"];
    this.personalityData["personality"] = options["personality"];
    this.personalityData["defaultMessage"] = options["defaultMessage"];
    return this.personalityData;
  }

  read(context) {
    this.personalityData =
      context.jsonDoc.json.extensions?.OMI_personality || {};
    return this;
  }

  write(context) {
    const jsonRoot = context.jsonDoc.json;
    jsonRoot.extensions = jsonRoot.extensions || {};
    jsonRoot.extensions[OMI_personalityExtension.EXTENSION_NAME] =
      this.personalityData;
    return this;
  }
}

function removeExtension(filename) {
  if (filename == null) {
    return "optimize";
  }
  return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

async function main() {
  const inputFile = process.argv[2];
  const tempFile = removeExtension(inputFile) + "_temp.glb";

  // Copy the vrm file to a temporary glb file.
  fs.copyFileSync(inputFile, tempFile);
  const io = new NodeIO().registerExtensions([
    ...KHRONOS_EXTENSIONS,
    VRMC_vrmExtension,
    VRMC_springBoneExtension,
    VRMC_node_constraintExtension,
    VRMExtension,
    VRMC_materials_mtoonExtension,
    OMI_personalityExtension,
  ]);
  const document = await io.read(tempFile);
  options = {};
  options["agent"] = process.argv[3];
  options["personality"] = process.argv[4];
  options["defaultMessage"] = process.argv[5];
  const personality = document.createExtension(OMI_personalityExtension);
  await personality.init(options);
  const outputFile = removeExtension(process.argv[2]);
  await document.transform(
    // Losslessly resample animation frames.
    resample(),
    // Remove unused nodes, textures, or other data.
    prune(),
    // Remove duplicate vertex or texture data, if any.
    dedup(),
    simplify({ simplifier: MeshoptSimplifier }),
    textureResize()
  );
  // Write the glb output to a temporary file.
  const tempOutputFile = outputFile + "_output.glb";
  await io.write(tempOutputFile, document);

  // Rename the output file to vrm.
  fs.renameSync(tempOutputFile, outputFile + "_output.vrm");

  // Remove the temporary glb file.
  fs.unlinkSync(tempFile);
}

main();
