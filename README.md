# OMI_personality Extension with gltf-transform to use it

# Description

This extension allows users to assign personality attributes to a glTF node appended to a file. The attributes include `agent`, `personality`, and `defaultMessage`. Currently this extension is only compatible with MagickML but will be adjusted to be interoperable with others as more options are available.

Usage:

1. `npm install`
2. `node ./personalityOptimize.js tubbypet.vrm "tubby" "#agent is cheery" "nya nya!"`
3. `node ./personalityOptimize.js tubbypet.glb`

# Extension Name

OMI_personality

# Support for GLTF Transform optimization for VRM files

Original vs Optimized:

1. 113_new.glb: 35M -> 113_new_output.glb: 20M
2. Anata_1070_Guilty_v2.glb: 14M -> Anata_1070_Guilty_v2_output.glb: 11M
3. tubbypet.glb: 1.8M -> tubbypets_output.glb: 380K

The overall performance depends on the specific use case and requirements.

# Extension Type

Node extension

# Properties

- `agent` (string) - The name of the agent assigned to the node.
- `personality` (string) - Typically a long prompt describing the character and their backstory.
- `defaultMessage` (string) - The default message for the node.

# JSON Schema

The following JSON schema defines the extension properties:

```json
{
  "definitions": {
    "OMI_personality": {
      "type": "object",
      "properties": {
        "agent": { "type": "string" },
        "personality": { "type": "string" },
        "defaultMessage": { "type": "string" }
      }
    }
  },
  "type": "object",
  "properties": {
    "extensions": {
      "type": "object",
      "properties": {
        "OMI_personality": { "$ref": "#/definitions/OMI_personality" }
      }
    }
  }
}
```

# Example

Here is an example of how the extension can be used in a glTF file:

```json
{
  "nodes": [
    {
      "name": "TubbyPet",
      "extensions": {
        "OMI_personality": {
          "agent": "tubby",
          "personality": "#agent is cheery.",
          "defaultMessage": "nya nya!"
        }
      }
    }
  ],
  "extensionsUsed": ["OMI_personality"]
}
```
