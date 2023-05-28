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

import {
  Extension,
  ExtensionProperty,
  PropertyType,
  WriterContext,
  ReaderContext,
} from "@gltf-transform/core";

type HumanoidData = {
  boneMappings: Record<string, string>;
  humanBones: {
    bone: string;
    node: number;
    useDefaultValues: boolean;
    min: [number, number, number];
    max: [number, number, number];
    center: [number, number, number];
    axisLength: number;
  }[];
  armStretch: number;
  legStretch: number;
  upperArmTwist: number;
  lowerArmTwist: number;
  upperLegTwist: number;
  lowerLegTwist: number;
  feetSpacing: number;
  hasTranslationDoF: boolean;
};

type MeshAnnotation = {
  mesh: number;
  firstPersonFlag: string;
};

type FirstPersonData = {
  firstPersonBone: number;
  firstPersonBoneOffset: {
    x: number;
    y: number;
    z: number;
  };
  meshAnnotations: MeshAnnotation[];
  lookAtTypeName: "Bone" | "BlendShape";
  lookAtHorizontalInner: DegreeMap;
  lookAtHorizontalOuter: DegreeMap;
  lookAtVerticalDown: DegreeMap;
  lookAtVerticalUp: DegreeMap;
};

type DegreeMap = {
  curve: [number, number][];
  xRange: number;
  yRange: number;
};

type BlendShapeMasterData = {
  blendShapeGroups: BlendShapeGroup[];
};

type BlendShapeGroup = {
  name: string;
  presetName:
    | "unknown"
    | "neutral"
    | "a"
    | "i"
    | "u"
    | "e"
    | "o"
    | "blink"
    | "joy"
    | "angry"
    | "sorrow"
    | "fun"
    | "lookup"
    | "lookdown"
    | "lookleft"
    | "lookright"
    | "blink_l"
    | "blink_r";
  binds: {
    mesh: number;
    index: number;
    weight: number;
  }[];
  materialValues: {
    materialName: string;
    propertyName: string;
    targetValue: number[];
  }[];
  isBinary: boolean;
};

type Material = {
  name: string;
  shader: string;
  renderQueue: number;
  floatProperties: Record<string, number>;
  vectorProperties: Record<string, [number, number, number, number]>;
  textureProperties: Record<string, number>;
  keywordMap: Record<string, boolean>;
  tagMap: Record<string, string>;
};

type MaterialPropertiesData = {
  materials: Material[];
};

type VRMSchemaData = {
  exporterVersion: string;
  specVersion: string;
};

type Spring = {
  comment: string;
  stiffiness: number;
  gravityPower: number;
  gravityDir: [number, number, number];
  dragForce: number;
  center: number;
  hitRadius: number;
};

type ColliderGroup = {
  node: number;
  colliders: {
    offset: {
      x: number;
      y: number;
      z: number;
    };
    radius: number;
  }[];
};

type SecondaryAnimationData = {
  boneGroups: Spring[];
  colliderGroups: ColliderGroup[];
};

type VRMMeta = {
  version: string;
  title: string;
  author: string;
  contactInformation: string;
  reference: string;
  texture: number | null;
  allowedUserName: "OnlyAuthor" | "ExplicitlyLicensedPerson" | "Everyone";
  violentUssageName: "Disallow" | "Allow";
  sexualUssageName: "Disallow" | "Allow";
  commercialUssageName: "Disallow" | "Allow";
  otherPermissionUrl: string;
  licenseName:
    | "Redistribution_Prohibited"
    | "CC0"
    | "CC_BY"
    | "CC_BY_NC"
    | "CC_BY_SA"
    | "CC_BY_NC_SA"
    | "CC_BY_ND"
    | "CC_BY_NC_ND"
    | "Other";
  otherLicenseUrl: string;
};

type VRMExtensionProperties = {
  meta: VRMMeta;
  humanoid: HumanoidData;
  firstPerson: FirstPersonData;
  blendShapeMaster: BlendShapeMasterData;
  secondaryAnimation: SecondaryAnimationData;
  materialProperties: MaterialPropertiesData;
  vrmSchema: VRMSchemaData;
};

class VRMProperties extends ExtensionProperty {
  protected init(): void {}

  readonly propertyType = "VRM";
  readonly parentTypes = [PropertyType.NODE];
  readonly extensionName = "VRM";
  readonly extension: VRMExtension;
}

class VRMExtension extends Extension {
  extensionName = 'VRM';
  static EXTENSION_NAME = "VRM";
  vrmData: VRMExtensionProperties | null = null;
  vrmProperties: VRMExtensionProperties;

  createVRM(name = ""): VRMProperties {
    return new VRMProperties(this.document.getGraph(), name);
  }

  read(context: ReaderContext): this {
    const vrmExtensions = context.jsonDoc.json.extensions?.VRM;
    if (!vrmExtensions) {
      return this;
    }

    this.vrmData = vrmExtensions as VRMExtensionProperties;
    return this;
  }

  write(context: WriterContext): this {
    const jsonRoot = context.jsonDoc.json;

    this.document
      .getRoot()
      .listNodes()
      .forEach((node) => {
        const vrmProps = node.getExtension(VRMExtension.EXTENSION_NAME);
        if (!vrmProps) return;

        const jsonNode = jsonRoot.nodes?.find(
          (currentNode) => currentNode === node
        );
        if (jsonNode) {
          jsonNode.extensions = jsonNode.extensions || {};
          if (this.vrmData) {
            jsonNode.extensions[VRMExtension.EXTENSION_NAME] = this.vrmData;
          }
        }
      });
    return this;
  }
}
