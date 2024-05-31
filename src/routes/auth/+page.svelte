<form method="POST" action="?/login" class="w-full">
<div class="hero-content lg:flex-row-reverse">
    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-200">
      <form class="card-body">
        <div class="form-control">
          <label class="label" for="email-input">
            <span class="label-text font-bold text-lg">Email</span>
          </label>
          <input name="email" type="email" class="input" />
        </div>
        <div class="form-control">
          <label class="label" for="password-input">
            <span class="label-text font-bold text-lg">Password</span>
          </label>
          <input name="password" type="password" class="input bg-base-300" />
          <label
            class="label"
            for="Forgot password and have an account buttons"
          >
            <a href="/auth/forgot-password" class="label-text-alt link link-hover"
              >Forgot password?</a
            >
          </label>
        </div>
        <div class="form-control">
            <button class="btn btn-neutral">Login</button>
            <button class="btn mt-2 btn-neutral" formaction="?/signup">Sign up</button>
        </div>
      </form>
    </div>
  </div>
</form>