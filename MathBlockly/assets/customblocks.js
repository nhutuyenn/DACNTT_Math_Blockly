document.addEventListener("DOMContentLoaded", function () {

    // Define the custom block
    Blockly.Blocks['block'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Hình vuông");
            this.appendValueInput("NAME")
                .setCheck(null)
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField("Hình ảnh:");
            this.setColour(180);
            this.setTooltip("");
            this.setHelpUrl("");
        }
    };

    Blockly.Blocks['image'] = {
        init: function () {
            this.appendDummyInput()
                .appendField(new Blockly.FieldImage("https://monka.vn/content/img/upload/u21-11-2018-09-45-16.png", 80, 80, { alt: "*", flipRtl: "FALSE" }));
            this.setOutput(true, null);
            this.setColour(165);
            this.setTooltip("");
            this.setHelpUrl("");
        }
    };

    var workspace = Blockly.inject('blocklyDiv', {
    });

    var newBlock = workspace.newBlock('block');
    newBlock.initSvg();
    newBlock.render();

    var imageBlock = workspace.newBlock('image');
    imageBlock.initSvg();
    imageBlock.render();

    // Define the custom block's JavaScript code generation
    Blockly.JavaScript['block'] = function (block) {
        var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
        var code = 'Hello ' + value_name + '\n';
        return code;
    };

});