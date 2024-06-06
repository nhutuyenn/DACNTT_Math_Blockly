
document.addEventListener("DOMContentLoaded", function() {

// Define the custom block
Blockly.Blocks['block'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Hình vuông");
        this.appendValueInput("NAME")
            .setCheck(null)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Hình ảnh:");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

var workspace = Blockly.inject('blocklyDiv', {
    toolbox: '<xml><block type="block"></block></xml>'
});

// Define the custom block's JavaScript code generation
Blockly.JavaScript['block'] = function (block) {
    var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'Hello ' + value_name + '\n';
    return code;
};

});