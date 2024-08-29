# The DigiPres Sandbox
## A Place To Play With Tools For Digital Preservation

<div class="warning">

This is a very early stage experimental prototype. It may fall over, or simple _cease to be_.

</div>

The [DigiPres Sandbox](https://github.com/digipres/sandbox) makes it possible to play with the tools supported by the [DigiPres Toolbox](https://github.com/digipres/toolbox), running it in the cloud so you can access it via your browser!

This works because it re-uses [the MyBinder Service](https://mybinder.org/), which is a cloud-hosted instance of [Binder](https://jupyter.org/binder). Binder was built to support reproducibility in scientific research, but can be used for all sorts of different things.[^1]

<div class="caution">

Because it's running in the cloud, the _DigiPres Sandbox_ can't affect anything on your computer - it's really just another web site!  However, if you want to experiment on your own files, you can choose to upload them through the web interface.

Any files you upload to this cloud-hosted service _should_ remain private, but this _cannot_ be guaranteed. __Do not upload sensitive material!__

Note also that this is an an ephemeral service designed for experimentation and your session will be __shut down and deleted__ if it appears not to be in use.

</div>

<div class="tip" label="Launch the DigiPres Sandbox!">

By clicking the button below, you can fire up a remote Linux session with a <a href="https://jupyter.org/">Jupyter Lab</a> interface, and start experimenting...

<p style="text-align: center;">
<a href="https://mybinder.org/v2/gh/digipres/sandbox/master" target="_blank" rel="noopener"><img src="https://mybinder.org/badge_logo.svg" style="max-width: 100%; vertical-align: middle;"></a>
</p>

Please be patient, as the service is sometimes heavily loaded[^2] it might take a minute or two to before things get started. Check the [MyBinder status page](https://mybinder.readthedocs.io/en/latest/about/status.html) for issues, and consider trying these direct links to specific services: [ovh](https://ovh.mybinder.org/v2/gh/digipres/sandbox/master), [gesis](https://notebooks.gesis.org/binder/v2/gh/digipres/sandbox/master), [curvenote](https://binder.curvenote.dev/v2/gh/digipres/sandbox/master).

Finally, please use the `File > Shutdown` menu option to close the session down when you've finished.

</div>

[^1]: Like [the GLAM Workbench](https://glam-workbench.net/using-binder/).

[^2]: Note that the MyBinder service has been [operating with reduced funding since April 2023](https://blog.jupyter.org/mybinder-org-reducing-capacity-c93ccfc6413f) and is actively [seeking wider funding](https://mybinder.readthedocs.io/en/latest/about/support.html) and [donations](https://numfocus.org/donate-to-jupyter).