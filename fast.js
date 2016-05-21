(function (window) {
	'use strict';

	class Fast {
		constructor(final, update) {
			var $this = this;

			this.protocol = 'http://';
			this.domain = 'api.fast.com';
			this.token = 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm';
			this.count = 3;
			this.range = 1024 * 1024 * 25;

			this.start = null;
			this.end = null;
			this.loaded = [];
			this.total = [];
			this.tally = 0;

			this.urls().then(function (urls) {
				$this.test(urls, final, update);
			});
		}

		urls() {
			var $this = this,
				url = `${this.protocol}${this.domain}/netflix/speedtest?https=true&token=${this.token}&urlCount=${this.count}`,
				urls = [],
				json = null;

			return new Promise(function (resolve) {
				var xhr = new XMLHttpRequest();

				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4 && xhr.status === 200) {
						json = JSON.parse(xhr.responseText);

						json.forEach(function (data) {
							urls.push(data.url.replace('speedtest', `speedtest/range/0-${$this.range}`));
						});

						resolve(urls);
					}
				};

				xhr.open('GET', url, true);
				xhr.send(null);
			});
		}

		download(url, i, update) {
			var $this = this;

			return new Promise(function (resolve) {
				var xhr = new XMLHttpRequest(),
					loaded = 0,
					total = 0,
					current = null,
					diff = 0,
					rate = 0;

				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4 && xhr.status === 200) {
						$this.tally += 1;

						total = 0;

						$this.total.forEach(function (num) {
							total += num;
						});

						$this.end = new Date();
						diff = ($this.end.getTime() - $this.start.getTime()) / 1000;
						rate = Math.round((total / 125000) / diff);

						update(rate);
						resolve(rate);
					}
				};

				xhr.onprogress = function (e) {
					if ($this.start === null) {
						$this.start = new Date();
					}

					$this.loaded[i] = e.loaded;
					$this.total[i] = e.total;

					loaded = 0;
					total = 0;

					$this.loaded.forEach(function (num) {
						loaded += num;
					});

					$this.total.forEach(function (num) {
						total += num;
					});

					current = new Date();
					diff = (current.getTime() - $this.start.getTime()) / 1000;

					if (diff) {
						rate = Math.round((loaded / 125000) / diff);
						update(rate);
					}
				};

				xhr.open('GET', url, true);
				xhr.send(null);
			});
		}

		test(urls, final, update) {
			var $this = this;

			urls.forEach(function (url, i) {
				$this.download(url, i, update).then(function () {
					if ($this.tally === $this.count) {
						final();
					}
				});
			});
		}
	}

	window.Fast = Fast;
}(window));