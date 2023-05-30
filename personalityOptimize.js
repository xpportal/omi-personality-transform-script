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
  NodeIO,
} = require("@gltf-transform/core");
const {
  KHRONOS_EXTENSIONS,
  InstancedMesh,
} = require("@gltf-transform/extensions");
const { meshoptimizer } = require("meshoptimizer");
const { MeshoptSimplifier } = require("meshoptimizer");
const fs = require('fs');


const {
  resample,
  prune,
  dedup,
  textureCompress,
  meshopt,
  textureResize,
  simplify,
  instance,
  quantize,
} = require("@gltf-transform/functions");
const { Document } = require("@gltf-transform/core");

class VRMProperties extends ExtensionProperty {
  init() {}

  propertyType = "VRM";
  parentTypes = [PropertyType.NODE];
  extensionName = "VRM";
  extension;
}

class VRMExtension extends Extension {
  extensionName = "VRM";
  static EXTENSION_NAME = "VRM";
  vrmData = null;
  vrmProperties;

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

class VRMC_materials_mtoonExtension extends VRMExtension {
  extensionName = "VRMC_materials_mtoon";
  static EXTENSION_NAME = "VRMC_materials_mtoon";
}

class OMI_personalityExtension extends Extension {
  extensionName = "OMI_personality";
  static EXTENSION_NAME = "OMI_personality";
  personalityData = {};
  init(options) {
    this.personalityData["agent"] = options["agent"]
    this.personalityData["personality"] = options["personality"]
    this.personalityData["defaultMessage"] = options["defaultMessage"]
    return this.personalityData;
  }

  read(context) {
    this.personalityData = context.jsonDoc.json.extensions?.OMI_personality || {};
    return this;
  }

  write(context) {
    const jsonRoot = context.jsonDoc.json;
    jsonRoot.extensions = jsonRoot.extensions || {};
    jsonRoot.extensions[OMI_personalityExtension.EXTENSION_NAME] = this.personalityData;
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
    VRMExtension,
    VRMC_materials_mtoonExtension,
    OMI_personalityExtension,
    ...KHRONOS_EXTENSIONS,
  ]);
  const document = await io.read(tempFile);
  options = {}
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
    textureResize(),
    // Caution against use on VRMs.
    // draco(),
    // meshopt(),
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