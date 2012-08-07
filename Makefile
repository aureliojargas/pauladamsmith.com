render:
	lessc css/base.less css/base.css
	static.py

publish:
	chmod 755 site
	rsync -e "ssh -4" -avz site/ pauladamsmith.com:~/web/public/
