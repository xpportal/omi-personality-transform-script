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
    const vrmExtensions = context.jsonDoc.json.extensions?.VRM;
    if (!vrmExtensions) {
      return this;
    }

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
class PersonalityProperties extends ExtensionProperty {
  static EXTENSION_NAME = "OMI_personality";
  extensionName = "OMI_personality";
  propertyType = "Personality";
  parentTypes = [PropertyType.NODE];

  getDefaults() {
    return Object.assign(super.getDefaults(), {
      agent: "tubby",
      personality: "#agent is cheery",
      defaultMessage: "nya nya!",
    });
  }
}

class Personality extends Extension {
  extensionName = "OMI_personality";
  static EXTENSION_NAME = "OMI_personality";
  createPersonality(name = "") {
    return new PersonalityProperties(this.document.getGraph(), name);
  }

  read(context) {
    return this;
  }

  write(context) {
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
  // Configure I/O.
  const io = new NodeIO().registerExtensions([
    VRMExtension,
    VRMC_materials_mtoonExtension,
    Personality,
    ...KHRONOS_EXTENSIONS,
  ]);
  // Read from URL.
  console.log(inputFile)
  const document = await io.read(inputFile);
  const outputFile = removeExtension(process.argv[2]);

  // Write to byte array (Uint8Array).
  await document.transform(
    // Losslessly resample animation frames.
    resample(),
    // Remove unused nodes, textures, or other data.
    prune(),
    // Remove duplicate vertex or texture data, if any.
    dedup(),
    simplify({ simplifier: MeshoptSimplifier }),
    textureResize()
    // Caution against use on VRMs.
    // draco(),
    // meshopt(),
  );
  const binary = await io.writeBinary(document);
  await io.write(outputFile + "_output.glb", document);
}

main();

