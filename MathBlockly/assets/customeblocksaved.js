document.addEventListener("DOMContentLoaded", function () {
  loadCustomblocksSaved();

  document.getElementById('firstBtnSaved').click();
});

function loadCustomblocksSaved() {
  var question = JSON.parse(document.getElementById('temp').getAttribute('data-questions'));
  const answers = JSON.parse(document.getElementById('answers').getAttribute('data-answers'));

  var tmp = "";
  let defaultToolbox = false;
  let a = "";
  for (var i = 0; i < answers.length; i++) {
    (function (index) {
      var path = answers[index].answer;
      var nameBlock = answers[index]._id;

      if (answers[index].answer === "defaultToolbox") {
        defaultToolbox = true;
      }
      else if (answers[index].connection === "topBottom") {
        Blockly.Blocks[nameBlock] = {
          init: function () {
            this.appendValueInput("NAME")
              .setCheck(null)
              .appendField(new Blockly.FieldImage(path, 80, 80, { alt: "*", flipRtl: "FALSE" }));
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(180);
            this.setTooltip("");
            this.setHelpUrl("");
          }
        };
      }
      else if (answers[index].connection === "leftRight") {
        Blockly.Blocks[nameBlock] = {
          init: function () {
            this.appendValueInput("NAME")
              .setCheck(null)
              .appendField(new Blockly.FieldImage(path, 80, 80, { alt: "*", flipRtl: "FALSE" }));
            this.setOutput(true, null);
            this.setColour(230);
            this.setTooltip("");
            this.setHelpUrl("");
          }
        };
      }
      else {
        Blockly.Blocks[nameBlock] = {
          init: function () {
            this.appendDummyInput('dummyImage')
              .appendField(new Blockly.FieldImage(path, 80, 80, { alt: "*", flipRtl: "FALSE" }));
            this.setOutput(true, null);
            this.setColour(165);
            this.setTooltip("");
            this.setHelpUrl("");
          }
        };
      }

      if (index === answers.length - 1) {
        tmp += '<block type="' + nameBlock + '"></block>';
      } else {
        tmp += '<block type="' + nameBlock + '"></block>, ';
      }
    })(i);
  }

  var workspace;

  if (defaultToolbox) {
    workspace = Blockly.inject('blocklyDiv', {
      toolbox: `
        <xml
          xmlns="https://developers.google.com/blockly/xml"
          id="toolbox-categories"
          style="display: none">
          <category name="Logic" categorystyle="logic_category">
            <block type="logic_compare"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Toán tử" categorystyle="math_category">
            <block type="math_number" gap="32">
              <field name="NUM">123</field>
            </block>

            <block type="math_arithmetic">
              <value name="A">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
              <value name="B">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
            </block>

            <block type="math_constrain">
              <value name="VALUE">
                <shadow type="math_number">
                  <field name="NUM">50</field>
                </shadow>
              </value>
              <value name="LOW">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
              <value name="HIGH">
                <shadow type="math_number">
                  <field name="NUM">100</field>
                </shadow>
              </value>
            </block>
          </category>
        </xml>
        `,
      trashcan: true
    });

  }
  else {
    workspace = Blockly.inject('blocklyDiv', {
      toolbox: '<xml>' + tmp + '</xml>',
      trashcan: true
    });
  }

  if (question[0].question.length > 0) {
    Blockly.Blocks['block'] = {
      init: function () {
        this.appendDummyInput("dummy_input")
          .appendField(question[0].question);
        this.appendValueInput("NAME")
          .setCheck(null)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Hình ảnh:");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
      }
    };


    let workspaceCoordinates = workspace.getMetricsManager().getViewMetrics(true)
    let x = workspaceCoordinates.left + (workspaceCoordinates.width / 6)
    let y = workspaceCoordinates.top + (workspaceCoordinates.height / 6)
    let blockCoordinates = new Blockly.utils.Coordinate(x, y)

    var newBlock = workspace.newBlock('block');
    newBlock.initSvg();
    newBlock.render();
    newBlock.moveTo(blockCoordinates)
  }

  // Define the custom block's JavaScript code generation
  /*Blockly.JavaScript['block'] = function (block) {
      var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
      var code = 'Hello ' + value_name + '\n';
      return code;
  };*/
}

function overBtn(btn){
  btn.style.backgroundColor = "#A5A6F6";
  btn.style.fontWeight = "bold";
}

function outBtn(btn){
  btn.style.backgroundColor = "white";
  btn.style.fontWeight = "normal";
}

/*
 `
        <xml
      xmlns="https://developers.google.com/blockly/xml"
      id="toolbox-categories"
      style="display: none">
      <category name="Logic" categorystyle="logic_category">
        <block type="logic_compare"></block>
        <block type="logic_boolean"></block>
      </category>
      <category name="Toán tử" categorystyle="math_category">
        <block type="math_number" gap="32">
          <field name="NUM">123</field>
        </block>
        <block type="math_arithmetic">
          <value name="A">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>

        <block type="math_constrain">
          <value name="VALUE">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="LOW">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="HIGH">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
      </category>


    </xml>
        `
*/
