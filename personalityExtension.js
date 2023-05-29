
const { Document, Extension, ExtensionProperty, PropertyType, WriterContext } = require('@gltf-transform/core');

class Personality extends Extension {
    extensionName = 'OMI_personality';
    static EXTENSION_NAME = 'OMI_personality';
    createPersonality(name = '') {
        return new PersonalityProperties(this.document.getGraph(), name);
    }

    read(context) {
        return this;
    }

    write(context) {
		return this;
    }
}

class PersonalityProperties extends ExtensionProperty {
    static EXTENSION_NAME = 'OMI_personality';

    init() {
        this.extensionName = 'OMI_personality';
        this.propertyType = 'Personality';
        this.parentTypes = [PropertyType.NODE];
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
			agent: "tubby",
			personality: "#agent is cheery",
			defaultMessage: "nya nya!",
		});
    }
}

const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');

module.exports = {
    extensions: [...ALL_EXTENSIONS, Personality],
    onProgramReady: ({ program, io, Session }) => {
        program
            .command('personality', 'Custom command')
            .help('Lorem ipsum dolorem...')
            .argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) model')
            .argument('<output>', 'Path to write output')
            .argument('<agent>', 'Name of the agent.')
            .argument('<personality>', 'What is the personality of the agent?')
            .argument('<defaultMessage>', 'Have a default message.')
            .action(({ args, options, logger }) =>
                Session.create(io, logger, args.input, args.output));
    },
   };

