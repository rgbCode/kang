// 페이지 로드 이벤트
app.config.onInit = function(afterAction) {
	app.auth.init({
		apiKey: "AIzaSyBZRZEplitTqua2QD95okfZZo77y-aNrcA",
		authDomain: "rgttest-915b9.firebaseapp.com",
		databaseURL: "https://rgttest-915b9.firebaseio.com",
		projectId: "rgttest-915b9",
		storageBucket: "rgttest-915b9.appspot.com",
		messagingSenderId: "537786332258"
	});

	app.loading();
	app.http.text('/kang/cmm/header.html').then(function(html) {
		$('#rgb-header').append(html);

		app.header = {
			vo: {
				title: '', login: '', menus: []
			},
			dom: $('#rgb-header').get(0)
		};
		return app.http.submit('/page.json', {}, false);
	}).then(function(rs) {
		app.log('-auth step1-');
		if(rs && rs.cno) {
			return app.header.vo.login(rs.cno);
		}

		// 인증 처리
		return app.auth.state();
	}).then(function(rs) {
		app.log('-auth step2-');
		if(!rs) return;

		return app.http.submit('/kang/member/r01.json', rs, false);
	}).then(function(rs) {
		app.log('-auth step3-');
		app.loading(false);
		if(rs && rs.cno) {
			app.header.vo.login(rs.cno);
		}

		afterAction && afterAction();
	}).catch(function(error) {
		app.log('-auth step4-');
		app.loading(false);
		afterAction && afterAction();
	});

	// 인증버튼
	app.header.on.auth = function(evt) {
		if(app.header.vo.login()) {
			app.popup.confirm('로그아웃 하시겠습니까?').then(function(rs){
				if(rs) {
					app.http.submit('/kang/member/r02.json').then(function(){
						return app.auth.close();
					}).then(function() {
						location.reload();
					});
				}
			});
		} else {
			app.modal.headerP01.open('/kang/cmm/header-p01.html').then(function(rs) {
				if(!rs) return;

				app.header.vo.login(rs);
				afterAction && afterAction();
			});
		}
	};

	// 인증팝업 컨트롤러
	app.modal = {
		name: 'headerP01',
		action: function(prm) {
			var p01 = this;
			p01.vo = {
				mode: 'login',
				loginId: '', loginPwd: '',
				joinId: '', joinPwd: '',
			};

			p01.on.close = function(e) {
				p01.close();
			};
			p01.on.mode = function(e) {
				p01.vo.mode(p01.vo.mode()=='login' ? 'join' : 'login')
				p01.uiUpdate();
			};
			p01.on.google = function(e) {
				app.loading()
				app.auth.google().then(function(rs){
					return app.http.submit('/kang/member/r01.json', rs, false);
				}).then(function(rs) {
					app.loading(false);
					p01.close(rs.cno)
				});
			};
			p01.on.facebook = function(e) {
			};
			p01.on.idpwd = function(e) {
				if(!p01.vo.loginId() || $('#header-p01-login-id').hasClass('is-invalid'))
					return $('#header-p01-login-id').addClass('is-invalid'), $('#header-p01-login-id >input').focus()
				if(!p01.vo.loginPwd() || $('#header-p01-login-pwd').hasClass('is-invalid'))
					return $('#header-p01-login-pwd').addClass('is-invalid'), $('#header-p01-login-pwd >input').focus()

				p01.close('1234')
			};
		}
	};
};

// 화면 UI갱신
app.config.uiUpdate = function(dom) {
	setTimeout(function() {
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-button')),
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-radio')),
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-menu')),
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-textfield')),
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-progress')),
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-tabs')),
		componentHandler.upgradeElements(dom.querySelectorAll('.mdl-tooltip'));
	}, 10);
};

// http
app.config.http = {
	host: 'https://rgb-code.000webhostapp.com'
};

// 뷰
app.config.view = {
	// 뷰를 담을 컨텐츠영역
	selector: '#rgbMain'
};

// 리소스
app.config.resource = {
	// 스타일시트
	style: [
		'#__resource__ {position:fixed; top:0; left:0; width:100%; z-index:33}',
		'#__resource__ .action-box {padding:12px; overflow-y:auto}',
		'#__resource__ .action-bar {padding:8px; text-align:right}',
		'#__resource__ .action-bar a {text-decoration:none}',
		'#__resource__ .rgb-datepicker a {text-dedecoration:none}',
		'#__resource__ .rgb-datepicker table {width:100%; border-collapse:collapse}',
		'#__resource__ .rgb-datepicker table th, #__resource__ .rgb-datepicker table td {text-align:center}',
		'#__modal__ >div {position:absolute; width:90%; background:#fff; box-shadow:3px 3px 10px 0 #666; z-index:10;}',	// display:none
		'#__sheet__ {position:fixed; bottom:0; right:0; width:100%; box-shadow:1px 1px 10px 1px #aaa; background:#fff}',

		'@keyframes modal-on{',
			'0% {margin-top:-10%}',
		'}',
		'@media (min-width: 700px){',
			'#__modal__ >div {width:600px}',
			'#__sheet__ {width:600px}',
		'}'
	].join(''),
	// 리소스 루트 영역
	root: {
		selector: '#__resource__',
		html: '<div id="__resource__"/>'
	},
	// 모달 다이얼로그
	modal: {
		selector: '#__modal__',
		boxSelector: '.action-box',
		html: '<div id="__modal__" style="width:100%"/>',
		onAnimation: 'modal-on 1s 1',
		dimmed: 'position:absolute; top:0; left:0; width:100%; background:#aaa; opacity:.6; z-index:10;'
	},
	// 모달리스 시트
	sheet: {
		selector: '#__sheet__',
		html: '<div id="__sheet__"/>',
		actionBar: [
			'<div style="position:absolute; top:-15px; right:15px">',
				'<button class="sheet-close mdl-button mdl-button--fab mdl-button--icon mdl-button--colored mdl-js-button mdl-js-ripple-effect">',
					'<i class="material-icons">clear</i>',
				'</button>',
			'</div>'
		].join('')
	},
	// 로딩바
	loadingBar: {
		selector: '#__modal__ .__loading__',
		html: [
			'<div class="__loading__" style="width:100%; display:block">',
				'<div style="position:fixed; top:0; left:0; width:100%; height:100% bakcground:#000; opacity:.2"></div>',
				'<div class="mdl-progress mdl-progress__indeterminate mdl-js-progress" style="width:100%"></div>',
				'<script>componentHandler.upgradeElements(document.querySelectorAll(\'.mdl-progress\'))</script>',
			'</div>'
		].join('')
	}
};

// 기본적인 팝업
app.config.popup = {
	toast: [
		'<div class="action-box mdl-color--grey-700 mdl-color-text--amber">',
			'<div data-bind="html:vo.message" style="font-weight:bold"></div>',
		'</div>'
	].join(''),
	alert: [
		'<div class="action-box">',
			'<div data-bind="html:vo.message" style="font-weight:bold"></div>',
		'</div>',
		'<div class="action-bar">',
			'<button class="mdl-button mdl-button--icon mdl-button--accent mdl-js-button" data-bind="click:on.close">',
			'<i class="material-icons">done</i>',
			'</button>',
		'</div>'
	].join(''),
	confirm: [
		'<div class="action-box">',
			'<div data-bind="html:vo.message" style="font-weight:bold"></div>',
		'</div>',
		'<div class="action-bar">',
			'<button class="mdl-button mdl-button--icon mdl-button--colored mdl-js-button" data-bind="click:on.cancel">',
			'<i class="material-icons">close</i>',
			'</button>',
			'<button class="mdl-button mdl-button--icon mdl-button--accent mdl-js-button" data-bind="click:on.ok">',
			'<i class="material-icons">done</i>',
			'</button>',
		'</div>'
	].join(''),
	datepicker: [
		'<div class="mdl-color--pink-A200 mdl-color-text--white" style="padding:20px; font-size:20px">',
			'<span data-bind="text:vo.year">0000</span>년',
			'<span data-bind="text:vo.month">00</span>월',
			'<!-- ko if:vo.day() > 0 --><span data-bind="text:vo.day">00</span>일<!-- /ko -->',
		'</div>',

		'<div class="action-box rgb-datepicker">',
			'<div class="mdl-grid">',
				'<div class="mdl-cell mdl-cell--12-col">',
					'<div style="float:left">',
						'<button class="mdl-button mdl-button--icon mdl-js-button" data-bind="click:on.preMon">',
						'<i class="material-icons">chevron_left</i>',
						'</button>',
						'<a href="#" style="margin-left:10px; margin-right:10px; color:#000">',
							'<strong data-bind="text:vo.year">0000</strong>년',
							'<strong data-bind="text:vo.month">00</strong>월',
						'</a>',
						'<button class="mdl-button mdl-button--icon mdl-js-button" data-bind="click:on.nxtMon">',
						'<i class="material-icons">chevron_right</i>',
						'</button>',
					'</div>',
					'<div style="clear:both"></div>',
				'</div>',
			'</div>',

			'<table class="rgb-datepicker--days">',
			'<thead></tr>',
				'<th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>',
			'</tr></thead>',
			'<tbody data-bind="foreach:vo.days"><tr>',
				'<td data-bind="if:$data[0]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'0\', ', 
					'\'mdl-color--pink-A200\': $data[0]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[0]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[0]">1</button>',
				'</td>',
				'<td data-bind="if:$data[1]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'1\', ', 
					'\'mdl-color--pink-A200\': $data[1]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[1]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[1]">1</button>',
				'</td>',
				'<td data-bind="if:$data[2]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'2\', ', 
					'\'mdl-color--pink-A200\': $data[2]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[2]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[2]">1</button>',
				'</td>',
				'<td data-bind="if:$data[3]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'3\', ', 
					'\'mdl-color--pink-A200\': $data[3]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[3]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[3]">1</button>',
				'</td>',
				'<td data-bind="if:$data[4]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'4\', ', 
					'\'mdl-color--pink-A200\': $data[4]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[4]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[4]">1</button>',
				'</td>',
				'<td data-bind="if:$data[5]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'5\', ', 
					'\'mdl-color--pink-A200\': $data[5]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[5]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[5]">1</button>',
				'</td>',
				'<td data-bind="if:$data[6]">',
				'<button class="mdl-button mdl-button--icon mdl-js-button" style="font-size:14px"  data-bind="css: {',
					'\'mdl-button--accent\': $data.today==\'6\', ', 
					'\'mdl-color--pink-A200\': $data[6]==$parent.vo.day(), ',
					'\'mdl-color-text--white\': $data[6]==$parent.vo.day()}, ',
					'click:$parent.on.day, text:$data[6]">1</button>',
				'</td>',
			'</tr></tbody>',
			'</table>',
		'</div>',

		'<div class="action-bar">',
			'<span data-bind="text:vo.message" style="color:#f00;"></span>',
			'<button class="mdl-button mdl-button--icon mdl-button--colored mdl-js-button" data-bind="click:on.cancel">',
			'<i class="material-icons">close</i>',
			'</button>',
			'<button class="mdl-button mdl-button--icon mdl-button--accent mdl-js-button" data-bind="click:on.ok">',
			'<i class="material-icons">done</i>',
			'</button>',
		'</div>'
	].join('')
};