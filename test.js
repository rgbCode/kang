!function(){
	app.launcher = function() {
		if(!app.header.vo.login())
			return app.header.vo.title('로그인 해주세요')

		app.view.v01.load('/kang/test-v01.html')
		app.header.vo.title('kang')
	};

	app.view = {
		name: 'v01',
		action: function(prm) {
			this.vo = {
				aaa: '1234'
			};

			this.on.test = function(x){
				// app.popup.alert('----')
				// app.log(app.util.today())
				// app.popup.datepicker('2018.01.01').then(function(rs){
				// 	app.log(rs)
				// })
				// app.modal('p01').open($(`
				// <div>aa<button data-bind="click:on.aa">aa</button></div>
				// `))
			};
		}
	};

	app.modal = {
		name: 'p01',
		action: function(prm) {
			this.on.aa = function(e){
				app.popup.alert('----')
			}
		}
	};

}();

