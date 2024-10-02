<script lang="ts">
  export let data
  const { supabase } = data

  let email = ''
  let password = ''

  // Login user
  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      window.location.href = '/'
    }
  }

  // Sign up user
  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert(error.message)
    } else {
      alert('Please check your email for a verification link.')
    }
  }
</script>

<div class="w-full">
  <div class="hero-content lg:flex-row-reverse">
    <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-200">
      <form class="card-body">
        <div class="form-control">
          <label class="label" for="email-input">
            <span class="label-text font-bold text-lg">Email</span>
          </label>
          <input name="email" type="email" class="input" bind:value={email} />
        </div>
        <div class="form-control">
          <label class="label" for="password-input">
            <span class="label-text font-bold text-lg">Password</span>
          </label>
          <input
            name="password"
            type="password"
            class="input bg-base-300"
            bind:value={password}
          />
          <label
            class="label"
            for="Forgot password and have an account buttons"
          >
            <a
              href="/auth/forgot-password"
              class="label-text-alt link link-hover">Forgot password?</a
            >
          </label>
        </div>
        <div class="form-control">
          <button class="btn btn-neutral" on:click={login}>Login</button>
          <button class="btn mt-2 btn-neutral" on:click={signUp}>Sign up</button
          >
        </div>
      </form>
    </div>
  </div>
</div>
