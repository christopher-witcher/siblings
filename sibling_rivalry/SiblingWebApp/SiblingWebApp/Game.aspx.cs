using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SiblingWebApp
{
    public partial class Game : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            String sBlock = "<script type='text/javascript' src='./Scripts/Game/game.js'></script>";
            ScriptManager.RegisterStartupScript(this, this.GetType(), "Game", sBlock, false);
        }
    }
}