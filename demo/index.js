require('../node_modules/quill/dist/quill.snow.css')
const React=require('../node_modules/react/dist/react-with-addons.js');
const ReactDOM=require('../node_modules/react-dom/dist/react-dom.js');
let ReactQuill=require('../src');
 
var Editor = React.createClass({

	getInitialState: function() {
		return {
			theme: 'snow',
			enabled: true,
			readOnly: false,
			value: '',
			events: []
		};
	},

	formatRange: function(range) {
		return range
			? [range.index, range.index + range.length].join(',')
			: 'none';
	},

	onTextareaChange: function(event) {
		var value = event.target.value;
		this.setState({ value:value });
	},

	onEditorChange: function(value, delta, source) {
		this.setState({
			value: value,
			events: [
				'text-change('+this.state.value+' -> '+value+')'
			].concat(this.state.events)
		});
	},

	onEditorChangeSelection: function(range, source) {
		this.setState({
			selection: range,
			events: [
				'selection-change('+
					this.formatRange(this.state.selection)
				+' -> '+
					this.formatRange(range)
				+')'
			].concat(this.state.events)
		});
	},

	onToggle: function() {
		this.setState({ enabled: !this.state.enabled });
	},

	onToggleReadOnly: function() {
		this.setState({ readOnly: !this.state.readOnly });
	},

	render: function() {
		return (
			React.DOM.div({},
				this.renderToolbar(),
				React.DOM.hr(),
				this.renderSidebar(),
				this.state.enabled && ReactQuill({
					theme: this.state.theme,
					value: this.state.value,
					modules: {
							toolbar: [
								[{ font: [] }, { size: [] }],
								[{ align: [] }, 'direction' ],
								[ 'bold', 'italic', 'underline', 'strike' ],
								[{ color: [] }, { background: [] }],
								[{ script: 'super' }, { script: 'sub' }],
								['blockquote', 'code-block' ],
								[{ list: 'ordered' }, { list: 'bullet'}, { indent: '-1' }, { indent: '+1' }],
								[ 'link', 'image', 'video' ],
								[ 'clean' ]
							],
							imageResize:{},
							imageDrop:true
					},
					imgUpload:{
						path:'upload',
						maxWidth:300,
						maxHeight:300,
						minWidth:100,
						minHeight:100,
						multiple:true
					},
					readOnly: this.state.readOnly,
					onChange: this.onEditorChange,
					onChangeSelection: this.onEditorChangeSelection
				})
			)
		);
	},

	renderToolbar: function() {
		var state = this.state;
		var enabled = state.enabled;
		var readOnly = state.readOnly;
		var selection = this.formatRange(state.selection);
		return (
			React.DOM.div({},
				React.DOM.button({
					onClick: this.onToggle },
					enabled? 'Disable' : 'Enable'
				),
				React.DOM.button({
					onClick: this.onToggleReadOnly },
					'Set ' + (readOnly? 'read/Write' : 'read-only')
				),
				React.DOM.button({
					disabled: true },
					'Selection: ('+selection+')'
				)
			)
		);
	},

	renderSidebar: function() {
		return (
			React.DOM.div({
				style: { overflow:'hidden', float:'right' }},
				React.DOM.textarea({
					style: { display:'block', width:300, height:300 },
					value: this.state.value,
					onChange: this.onTextareaChange
				}),
				React.DOM.textarea({
					style: { display:'block', width:300, height:300 },
					value: this.state.events.join('\n')
				})
			)
		);
	}

});

Editor = React.createFactory(Editor);
ReactQuill = React.createFactory(ReactQuill);

ReactDOM.render(
	Editor(),
	document.getElementById('app')
);
